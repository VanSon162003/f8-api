const LessonsService = require("@/service/admin/lessons.service");
const response = require("@/utils/response");

class LessonsController {
    // Upload video file
    async uploadVideo(req, res) {
        try {
            if (!req.file) {
                return response.error(res, 400, "Không tìm thấy file video");
            }

            const videoUrl = `videos/${req.file.filename}`;
            response.success(res, 200, {
                video_url: videoUrl,
            });
        } catch (error) {
            response.error(res, 500, error.message || "Internal server error");
        }
    }

    // Get all lessons with pagination
    async getAllLessons(req, res) {
        try {
            const { page = 1, limit = 10, search = "" } = req.query;
            const lessons = await LessonsService.getAllLessons(
                parseInt(page),
                parseInt(limit),
                req.user,
                search
            );

            response.success(res, 200, lessons);
        } catch (error) {
            response.error(res, 500, error.message || "Internal server error");
        }
    }

    // Update lesson position
    async updatePosition(req, res) {
        try {
            const { id: lessonId } = req.params;
            const { position, track_id: trackId } = req.body;

            if (position === undefined || !trackId) {
                return response.error(
                    res,
                    400,
                    "Position and track_id are required"
                );
            }

            await LessonsService.updatePosition(
                lessonId,
                position,
                trackId,
                req.user
            );
            response.success(res, 200, {
                message: "Lesson position updated successfully",
            });
        } catch (error) {
            response.error(
                res,
                error.status || 500,
                error.message || "Internal server error"
            );
        }
    }

    // Create new lesson
    async createLesson(req, res) {
        try {
            const lessonData = {
                ...req.body,
                thumbnail: req.file || null,
            };

            if (!lessonData.title || !lessonData.track_id) {
                return response.error(
                    res,
                    400,
                    "Title and track_id are required"
                );
            }

            const lesson = await LessonsService.createLesson(
                lessonData,
                req.user
            );
            response.success(res, 201, lesson);
        } catch (error) {
            response.error(res, 500, error.message || "Internal server error");
        }
    }

    // Update lesson
    async updateLesson(req, res) {
        try {
            const { id } = req.params;

            const lessonData = {
                ...req.body,
                thumbnail: req.file,
            };

            if (!lessonData.title || !lessonData.track_id) {
                return response.error(
                    res,
                    400,
                    "Title and track_id are required"
                );
            }

            const lesson = await LessonsService.updateLesson(
                id,
                lessonData,
                req.user
            );
            if (!lesson) {
                return response.error(res, 404, "Lesson not found");
            }

            response.success(res, 200, lesson);
        } catch (error) {
            response.error(res, 500, error.message || "Internal server error");
        }
    }

    // Delete lesson
    async deleteLesson(req, res) {
        try {
            const { id } = req.params;
            const result = await LessonsService.deleteLesson(id, req.user);

            if (!result) {
                return response.error(res, 404, "Lesson not found");
            }

            response.success(res, 200, {
                message: "Lesson deleted successfully",
            });
        } catch (error) {
            response.error(res, 500, error.message || "Internal server error");
        }
    }
}

module.exports = new LessonsController();
