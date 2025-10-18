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

const getProgress = async (req, res) => {
    try {
        const data = await coursesService.getProgress(
            req.user,
            req.params.courseId
        );

        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};
const updateProgress = async (req, res) => {
    try {
        const data = await coursesService.updateProgress(
            req.user,
            req.params.courseId,
            req.body.lesson_id
        );

        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const getUserLessonProgress = async (req, res) => {
    try {
        const data = await coursesService.getUserLessonProgress(
            req.user,
            req.params.courseId
        );

        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const updateUserLessonProgress = async (req, res) => {
    try {
        const { lessonId, watchDuration, lastPosition, completed } = req.body;

        const data = await coursesService.updateUserLessonProgress(
            req.user,
            lessonId,
            { watchDuration, lastPosition, completed }
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
    getProgress,
    updateProgress,
    getUserLessonProgress,
    updateUserLessonProgress,
};
