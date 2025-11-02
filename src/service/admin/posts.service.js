const { Post, User, Topic, sequelize } = require("../../db/models");
const { Op } = require("sequelize");

class PostsService {
    async getAllPosts(page, limit, search) {
        try {
            const offset = (page - 1) * limit;

            // Build search condition
            const whereCondition = search
                ? {
                      [Op.or]: [{ title: { [Op.like]: `%${search}%` } }],
                  }
                : {};

            // Get posts with pagination and search
            const { rows: posts, count } = await Post.findAndCountAll({
                attributes: [
                    "id",
                    "title",
                    "user_id",
                    "views_count",
                    "is_approved",
                ],
                include: [
                    {
                        model: User,
                        as: "author",
                        attributes: ["id", "full_name", "email"],
                    },
                    {
                        model: Topic,
                        as: "topics",
                        attributes: ["id", "name"],
                    },
                ],
                where: whereCondition,
                limit: +limit,
                offset: offset,
            });

            return {
                posts,
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

    async updateApproveStatus(id, isApproved) {
        try {
            const post = await Post.findByPk(id);
            if (!post) {
                throw new Error("Post not found");
            }

            await post.update({ is_approved: isApproved });
            return post;
        } catch (error) {
            throw error;
        }
    }

    async deletePost(id) {
        try {
            const post = await Post.findByPk(id);
            if (!post) {
                throw new Error("Post not found");
            }

            await post.destroy();
            return true;
        } catch (error) {
            throw error;
        }
    }

    async approveAllPosts() {
        try {
            const result = await Post.update(
                { is_approved: true },
                {
                    where: { is_approved: false },
                    returning: true,
                }
            );

            return {
                updatedCount: result[0],
                message: `Đã duyệt ${result[0]} bài viết`,
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new PostsService();
