const { Post, User } = require("@models");

const getPopular = async (limit = 8) => {
    try {
        const posts = await Post.findAll({
            order: [["views_count", "DESC"]],
            limit,
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "full_name", "username", "avatar"],
                },
            ],
        });
        return posts;
    } catch (error) {
        throw new Error(error.message || error);
    }
};

module.exports = { getPopular };
