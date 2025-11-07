const { Comment, User, Post, Course, sequelize } = require("../../db/models");
const { Op } = require("sequelize");

class CommentsService {
    async getAllComments(page, limit, search) {
        try {
            // Ensure page and limit are valid numbers
            const currentPage = Math.max(parseInt(page) || 1, 1);
            const itemsPerPage = Math.max(parseInt(limit) || 10, 1);
            const offset = (currentPage - 1) * itemsPerPage;

            // Build search condition with content and user name search
            const whereCondition = search
                ? {
                      [Op.or]: [
                          { content: { [Op.like]: `%${search}%` } },
                          { "$user.full_name$": { [Op.like]: `%${search}%` } },
                      ],
                  }
                : {};

            // Get total count first
            const totalCount = await Comment.count({
                where: whereCondition,
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: [],
                    },
                ],
                distinct: true,
                paranoid: false,
            });

            // Get comments for current page
            const comments = await Comment.findAll({
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
                limit: itemsPerPage,
                offset: offset,
                order: [["created_at", "DESC"]],
                paranoid: false,
            });

            // Get all unique commentable IDs grouped by type
            const commentableIds = {
                Post: [
                    ...new Set(
                        comments
                            .filter((c) => c.commentable_type === "post")
                            .map((c) => c.commentable_id)
                    ),
                ],
                Course: [
                    ...new Set(
                        comments
                            .filter((c) => c.commentable_type === "question")
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

                if (plainComment.commentable_type === "post") {
                    const post = postsMap.get(plainComment.commentable_id);
                    if (post) {
                        commentable = {
                            type: "Post",
                            id: post.id,
                            title: post.title,
                        };
                    }
                } else if (plainComment.commentable_type === "question") {
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

            // Calculate total pages
            const totalPages = Math.ceil(totalCount / itemsPerPage);

            // Adjust current page if it exceeds total pages
            const adjustedPage = Math.min(currentPage, totalPages || 1);

            return {
                comments: transformedComments,
                pagination: {
                    total: totalCount,
                    page: adjustedPage,
                    limit: itemsPerPage,
                    total_pages: totalPages,
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
