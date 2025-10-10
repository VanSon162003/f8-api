const { Course, User, Video } = require("@models");

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

module.exports = { getAll, getAllVideos };
