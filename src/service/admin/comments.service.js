const { Comment, User, Post, Course, sequelize } = require("../../db/models");
const { Op } = require("sequelize");

class CommentsService {
    async getAllComments(page, limit, search) {
        try {
            const offset = (page - 1) * limit;

            // Build search condition with content and user name search
            const whereCondition = search
                ? {
                      [Op.or]: [
                          { content: { [Op.like]: `%${search}%` } },
                          { "$user.full_name$": { [Op.like]: `%${search}%` } },
                      ],
                  }
                : {};

            // Get comments with pagination and search
            const { rows: comments, count } = await Comment.findAndCountAll({
                attributes: [
                    "id",
                    "content",
                    "commentable_type",
                    "commentable_id",
                    "deleted_at",
                    "created_at",
                    "updated_at",
                ],
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ["id", "full_name", "email", "avatar"],
                    },
                ],
                where: whereCondition,
                limit: +limit,
                offset: offset,
                order: [["created_at", "DESC"]],
                distinct: true,
                paranoid: false,
            });

            // Get all unique commentable IDs grouped by type
            const commentableIds = {
                Post: [
                    ...new Set(
                        comments
                            .filter((c) => c.commentable_type === "Post")
                            .map((c) => c.commentable_id)
                    ),
                ],
                Course: [
                    ...new Set(
                        comments
                            .filter((c) => c.commentable_type === "Course")
                            .map((c) => c.commentable_id)
                    ),
                ],
            };

            // Fetch all related posts and courses in bulk
            const [posts, courses] = await Promise.all([
                commentableIds.Post.length > 0
                    ? Post.findAll({
                          where: { id: commentableIds.Post },
                          attributes: ["id", "title"],
                      })
                    : [],
                commentableIds.Course.length > 0
                    ? Course.findAll({
                          where: { id: commentableIds.Course },
                          attributes: ["id", "title"],
                      })
                    : [],
            ]);

            // Create lookup maps for faster access
            const postsMap = new Map(posts.map((p) => [p.id, p]));
            const coursesMap = new Map(courses.map((c) => [c.id, c]));

            // Transform comments with efficient lookups
            const transformedComments = comments.map((comment) => {
                const plainComment = comment.get({ plain: true });
                let commentable = null;

                if (plainComment.commentable_type === "Post") {
                    const post = postsMap.get(plainComment.commentable_id);
                    if (post) {
                        commentable = {
                            type: "Post",
                            id: post.id,
                            title: post.title,
                        };
                    }
                } else if (plainComment.commentable_type === "Course") {
                    const course = coursesMap.get(plainComment.commentable_id);
                    if (course) {
                        commentable = {
                            type: "Course",
                            id: course.id,
                            title: course.title,
                        };
                    }
                }

                return {
                    ...plainComment,
                    commentable,
                };
            });

            return {
                comments: transformedComments,
                pagination: {
                    total: count,
                    page: +page,
                    limit: +limit,
                    total_pages: Math.ceil(count / limit),
                },
            };
        } catch (error) {
            throw error;
        }
    }

    async updateVisibility(id, visible) {
        try {
            const comment = await Comment.findByPk(id, {
                paranoid: false, // This allows us to find soft-deleted records
            });

            if (!comment) {
                throw new Error("Comment not found");
            }

            if (visible) {
                // Restore the comment (set deleted_at to null)
                await comment.restore();
            } else {
                // Soft delete the comment (set deleted_at to current timestamp)
                await comment.destroy();
            }

            return comment;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new CommentsService();
