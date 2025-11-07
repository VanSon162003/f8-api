const { Post } = require("../db/models");
const { Op } = require("sequelize");

const publishScheduledPosts = async () => {
    try {
        // Lấy thời gian hiện tại

        const now = new Date();

        // Tìm tất cả các post có trạng thái schedule và thời gian xuất bản nhỏ hơn hoặc bằng hiện tại
        const scheduledPosts = await Post.findAll({
            where: {
                visibility: "schedule",
                published_at: {
                    [Op.lte]: now,
                },
            },
        });

        // Cập nhật trạng thái của các post thành published
        if (scheduledPosts.length > 0) {
            const updatePromises = scheduledPosts.map((post) => {
                return Post.update(
                    {
                        visibility: "published",
                        status: "published",
                    },
                    {
                        where: {
                            id: post.id,
                        },
                    }
                );
            });

            await Promise.all(updatePromises);
            console.log(
                `${
                    scheduledPosts.length
                } posts have been published at ${now.toISOString()}`
            );
        }
    } catch (error) {
        console.error("Error in publishScheduledPosts task:", error);
    }
};

module.exports = publishScheduledPosts;
