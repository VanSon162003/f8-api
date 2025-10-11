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
        const data = await coursesService.getBySlug(req.params.slug);

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

module.exports = {
    getAll,
    getAllVideos,
    getBySlug,
};
