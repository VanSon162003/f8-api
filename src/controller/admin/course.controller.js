const courseService = require("@services/admin/course.service");
const response = require("@/utils/response");

exports.getAllCourses = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        console.log(req.user);

        const courses = await courseService.getAllCourses(
            req.user,
            parseInt(page),
            parseInt(limit),
            search
        );

        response.success(res, 200, courses);
    } catch (error) {
        next(error);
    }
};

exports.createCourse = async (req, res, next) => {
    try {
        const courseData = {
            ...req.body,
            thumbnail: req.file ? req.file : null,
        };

        const course = await courseService.createCourse(courseData, req.user);

        response.success(res, 201, course);
    } catch (error) {
        next(error);
    }
};

exports.editCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            thumbnail: req.file ? req.file : undefined,
        };

        const course = await courseService.editCourse(id, updateData, req.user);

        response.success(res, 200, course);
    } catch (error) {
        next(error);
    }
};

exports.updateCourseStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const status = req.body.status;

        const course = await courseService.updateCourseStatus(id, status);

        response.success(res, 200, course);
    } catch (error) {
        next(error);
    }
};

exports.removeCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        await courseService.removeCourse(id);

        response.success(res, 200, null);
    } catch (error) {
        next(error);
    }
};
