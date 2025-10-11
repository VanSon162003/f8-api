const { Course, User, Video, Track, Lesson } = require("@models");

const getAll = async () => {
    try {
        const courses = await Course.findAll({
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "full_name", "username", "avatar"],
                },
            ],
        });
        return courses;
    } catch (error) {
        throw new Error(error);
    }
};

const getBySlug = async (slug) => {
    try {
        const course = await Course.findOne({
            where: {
                slug,
            },

            include: {
                model: Track,
                as: "tracks",
                attributes: [
                    "id",
                    "course_id",
                    "title",
                    "total_lesson",
                    "total_duration",
                    "position",
                ],
                include: {
                    model: Lesson,
                    as: "lessons",

                    attributes: [
                        "id",
                        "track_id",
                        "title",
                        "duration",
                        "position",
                    ],
                },
            },
        });
        return course;
    } catch (error) {
        throw new Error(error);
    }
};

const getAllVideos = async (limit = 8) => {
    try {
        const videos = await Video.findAll({
            limit,
        });
        return videos;
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = { getAll, getAllVideos, getBySlug };
