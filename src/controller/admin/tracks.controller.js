const TracksService = require("@/service/admin/tracks.service");
const response = require("@/utils/response");

class TracksController {
    // Get all tracks with pagination
    async getAllTracks(req, res) {
        try {
            const { page = 1, limit = 10, search = "" } = req.query;
            const tracks = await TracksService.getAllTracks(
                parseInt(page),
                parseInt(limit),
                req.user,
                search
            );

            response.success(res, 200, tracks);
        } catch (error) {
            response.error(res, 500, error.message || "Internal server error");
        }
    }

    // Create new track
    async createTrack(req, res) {
        try {
            const { title, course_id, position } = req.body;
            if (!title || !course_id) {
                return res
                    .status(400)
                    .json({ message: "Title and course_id are required" });
            }
            const track = await TracksService.createTrack(
                {
                    title,
                    course_id,
                    position,
                },
                req.user
            );

            response.success(res, 201, track);
        } catch (error) {
            response.error(res, 500, error.message || "Internal server error");
        }
    }

    // Update track
    async updateTrack(req, res) {
        try {
            const { id } = req.params;
            const { title, course_id } = req.body;
            if (!title || !course_id) {
                response.error(res, 400, "Title and course_id are required");
            }
            const track = await TracksService.updateTrack(
                id,
                {
                    title,
                    course_id,
                },
                req.user
            );
            if (!track) {
                response.error(res, 404, "Track not found");
            }

            response.success(res, 200, track);
        } catch (error) {
            response.error(res, 500, error.message || "Internal server error");
        }
    }

    // Delete track
    async deleteTrack(req, res) {
        try {
            const { id } = req.params;
            const result = await TracksService.deleteTrack(id, req.user);
            if (!result) {
                response.error(res, 404, "Track not found");
            }

            response.success(res, 204, {
                message: "Track deleted successfully",
            });
        } catch (error) {
            response.error(res, 500, error.message || "Internal server error");
        }
    }

    // Update track positions
    async updatePositions(req, res) {
        try {
            const { tracks } = req.body;
            if (!Array.isArray(tracks)) {
                return response.error(res, 400, "Tracks must be an array");
            }

            await TracksService.updatePositions(tracks, req.user);
            response.success(res, 200, {
                message: "Track positions updated successfully",
            });
        } catch (error) {
            response.error(
                res,
                error.status || 500,
                error.message || "Internal server error"
            );
        }
    }
}

module.exports = new TracksController();
