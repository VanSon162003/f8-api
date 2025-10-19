const {
    Comment,
    User,
    CommentReaction,
    ReactionType,
    Notification,
    Post,
} = require("@models");
const { updateUserActivity } = require("./auth.service");

const { where } = require("sequelize");
const pusherService = require("./pusher.service");
const notificationsService = require("./notifications.service");

const markCurrentUserReaction = (currentUser, comments) => {
    return comments.map((comment) => {
        const userReaction = comment?.reactions?.find(
            (r) => r.user?.id === currentUser?.id
        );
        // return userReaction;

        return {
            ...comment.toJSON(),
            currentUserReaction: userReaction
                ? userReaction.reactionType
                : null,
            replies: comment.replies
                ? markCurrentUserReaction(currentUser, comment.replies)
                : [],
        };
    });
};

const getAllByType = async ({
    id,
    type,
    limit = 10,
    offset = 0,
    currentUser,
}) => {
    try {
        const comments = await Comment.findAll({
            where: {
                commentable_type: type,
                commentable_id: id,
                parent_id: null,
                deleted_at: null,
            },
            paranoid: true,

            limit: +limit,
            offset: +offset,
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "full_name", "username", "avatar"],
                    // include: {
                    //     model: CommentReaction,
                    //     as: "commentReactions",
                    //     attributes: ["id"],
                    //     include: {
                    //         model: ReactionType,
                    //         as: "reactionType",
                    //     },
                    // },
                },
                {
                    model: Comment,
                    as: "replies",
                    where: {
                        deleted_at: null,
                    },

                    required: false,
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: [
                                "id",
                                "full_name",
                                "username",
                                "avatar",
                            ],
                        },
                        {
                            model: CommentReaction,
                            as: "reactions",
                            include: [
                                {
                                    model: ReactionType,
                                    as: "reactionType",
                                },

                                {
                                    model: User,
                                    as: "user",
                                    attributes: [
                                        "id",
                                        "full_name",
                                        "username",
                                        "avatar",
                                    ],
                                },
                            ],
                        },
                    ],
                },

                {
                    model: CommentReaction,
                    as: "reactions",
                    include: [
                        {
                            model: ReactionType,
                            as: "reactionType",
                        },

                        {
                            model: User,
                            as: "user",
                            attributes: [
                                "id",
                                "full_name",
                                "username",
                                "avatar",
                            ],
                        },
                    ],
                },
            ],
            order: [["created_at", "DESC"]],
        });
        const result = markCurrentUserReaction(currentUser, comments);
        return result;
    } catch (error) {
        throw new Error(error.message || error);
    }
};

const create = async (data, currentUser) => {
    try {
        if (!currentUser)
            throw new Error("Bạn cần đăng nhập trước khi comment");

        const comment = await Comment.create({
            commentable_id: data.id,
            commentable_type: data.type,
            user_id: currentUser.id,
            parent_id: data.parent_id || null,
            content: data.content,
        });

        // Send notification for reply if it's a reply to another comment

        if (data.parent_id) {
            await notificationsService.sendReplyNotification(
                comment,
                currentUser
            );
        }

        // Ghi nhận hoạt động comment
        if (data.type === "post") {
            await updateUserActivity(currentUser.id, "comment_post");
            !data.parent_id &&
                (await pusherService.sendComment(data, currentUser, comment));
        } else if (data.type === "question") {
            await updateUserActivity(currentUser.id, "comment_question");
        }
        return comment;
    } catch (error) {
        throw new Error(error);
    }
};

const edit = async (commentId, content, currentUser) => {
    try {
        if (!currentUser)
            throw new Error("Bạn cần đăng nhập trước khi sửa comment");

        const comment = await Comment.findByPk(commentId);

        if (!comment) throw new Error("Comment không tồn tại");

        comment.content = content;

        await comment.save();

        return comment;
    } catch (error) {
        throw new Error(error);
    }
};

const remove = async (commentId, currentUser) => {
    try {
        if (!currentUser)
            throw new Error("Bạn cần đăng nhập trước khi xóa comment");

        const comment = await Comment.findByPk(commentId);
        if (!comment) throw new Error("Comment không tồn tại");

        await comment.destroy();

        return;
    } catch (error) {
        throw error;
    }
};

const handleReaction = async (commentId, reaction, currentUser) => {
    if (!currentUser)
        throw new Error("Bạn cần đăng nhập trước khi thả cảm xúc");

    const commentReactionExits = await CommentReaction.findOne({
        where: {
            user_id: currentUser.id,
            comment_id: commentId,
        },
    });

    const comment = await Comment.findByPk(commentId);

    if (reaction.action && commentReactionExits) {
        comment.like_count -= 1;
        await comment.save();
        return await commentReactionExits.destroy();
    }

    if (commentReactionExits && !reaction.action) {
        commentReactionExits.reaction_type_id = reaction.id;
        return await commentReactionExits.save();
    }

    comment.like_count += 1;
    await comment.save();

    const newReaction = await CommentReaction.create({
        user_id: currentUser?.id,
        comment_id: commentId,
        reaction_type_id: reaction.id,
    });

    // Send notification for the new reaction
    try {
        if (!comment.user_id || comment.user_id === currentUser.id)
            return newReaction;

        // Get associated post if comment is on a post
        let postSlug = null;
        if (comment.commentable_type === "post") {
            const post = await Post.findByPk(comment.commentable_id);
            if (post) {
                postSlug = post.slug;
            }
        }

        await notificationsService.sendReactionNotification(
            {
                targetId: commentId,
                targetType: "comment",
                type: "comment_react",
                reactionLabel: reaction.label,
                commentableType: comment.commentable_type,
                commentableId: comment.commentable_id,
                postSlug: postSlug,
            },
            currentUser
        );
    } catch (error) {
        console.error("Error sending reaction notification:", error);
    }

    return newReaction;
};

module.exports = { getAllByType, create, edit, remove, handleReaction };
