const learningPathService = require("@/service/admin/learningPath.service");
const response = require("@/utils/response");
class LearningPathController {
    // Get all learning paths with pagination and search
    async getAllLearningPaths(req, res) {
        try {
            const { page = 1, limit = 10, search = "" } = req.query;
            const result = await learningPathService.getAllLearningPaths(
                page,
                limit,
                search
            );

            response.success(res, 200, result);
        } catch (error) {
            response.error(res, 400, error.message);
        }
    }

    // Get learning path by ID
    async getLearningPathById(req, res) {
        try {
            const { id } = req.params;
            const learningPath = await learningPathService.getLearningPathById(
                id
            );
            res.json({
                message: "Success",
                data: learningPath,
            });

            response.success(res, 200, learningPath);
        } catch (error) {
            response.error(res, 400, error.message);
        }
    }

    // Create new learning path
    async createLearningPath(req, res) {
        try {
            const data = req.body;
            const learningPath = await learningPathService.createLearningPath(
                data,
                req.file
            );

            response.success(res, 201, learningPath);
        } catch (error) {
            response.error(res, 400, error.message);
        }
    }

    // Update learning path
    async updateLearningPath(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const learningPath = await learningPathService.updateLearningPath(
                id,
                data,
                req.file
            );

            response.success(res, 200, learningPath);
        } catch (error) {
            response.error(res, 400, error.message);
        }
    }

    // Delete learning path
    async deleteLearningPath(req, res) {
        try {
            const { id } = req.params;
            await learningPathService.deleteLearningPath(id);

            response.success(res, 200, {
                message: "Learning path deleted successfully",
            });
        } catch (error) {
            response.error(res, 400, error.message);
        }
    }

    // Add course to learning path
    async addCourseToPath(req, res) {
        try {
            const { pathId } = req.params;
            const { course_id: courseId, position } = req.body;
            const result = await learningPathService.addCourseToPath(
                pathId,
                courseId,
                position
            );

            response.success(res, 201, result);
        } catch (error) {
            response.error(res, 400, error.message);
        }
    }

    // Remove course from learning path
    async removeCourseFromPath(req, res) {
        try {
            const { pathId, courseId } = req.params;
            await learningPathService.removeCourseFromPath(pathId, courseId);

            response.success(res, 200, {
                message: "Course removed from learning path successfully",
            });
        } catch (error) {
            response.error(res, 400, error.message);
        }
    }

    // Update course position in learning path
    async updateCoursePosition(req, res) {
        try {
            const { pathId, courseId } = req.params;
            const { position } = req.body;
            const result = await learningPathService.updateCoursePosition(
                pathId,
                courseId,
                position
            );

            response.success(res, 200, result);
        } catch (error) {
            response.error(res, 400, error.message);
        }
    }
}

module.exports = new LearningPathController();
