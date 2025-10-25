const { Course, Post, User } = require("@/db/models");
const { Op, where } = require("sequelize");

const search = async (q, { limit = 5 }) => {
    const courses = await Course.findAll({
        where: {
            [Op.or]: [
                {
                    title: {
                        [Op.like]: `%${q}%`,
                    },
                },
                {
                    description: {
                        [Op.like]: `%${q}%`,
                    },
                },
            ],
        },

        include: [
            {
                model: User,
                as: "creator",
                attributes: ["id", "full_name", "username", "avatar"],
            },

            {
                model: User,
                as: "users",
                attributes: ["id", "full_name", "username", "avatar"],
            },
        ],
        limit: limit,
    });

    const posts = await Post.findAll({
        where: {
            [Op.or]: [
                {
                    title: {
                        [Op.like]: `%${q}%`,
                    },
                },
                {
                    content: {
                        [Op.like]: `%${q}%`,
                    },
                },
            ],
            status: "published",
            visibility: "published",
        },
        limit: limit,
    });

    const videos = [];

    return {
        courses,
        posts,
        videos,
    };
};

module.exports = { search };
