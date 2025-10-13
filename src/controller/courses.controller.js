const coursesService = require("@/service/courses.service");
const response = require("@/utils/response");
const getAll = async (req, res) => {
    try {
        const data = await coursesService.getAll();

        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const getBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const { limit, offset } = req.query;
        console.log(limit, offset);

        const data = await coursesService.getBySlug(
            slug,
            req.user,
            offset,
            limit
        );

        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const getAllVideos = async (req, res) => {
    try {
        const data = await coursesService.getAllVideos();

        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const registerCourse = async (req, res) => {
    try {
        const data = await coursesService.registerCourse(
            req.user,
            req.body.course_id
        );

        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

module.exports = {
    getAll,
    getAllVideos,
    getBySlug,
    registerCourse,
};
