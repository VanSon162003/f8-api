const commentsService = require("../../service/admin/comments.service");

class CommentsController {
    // Get all comments with pagination
    async getAllComments(req, res) {
        try {
            const { page = 1, limit = 10, search = "" } = req.query;
            const result = await commentsService.getAllComments(
                page,
                limit,
                search
            );
            res.json({
                status: "success",
                data: result,
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: error.message,
            });
        }
    }

    // Update comment visibility (soft delete)
    async updateVisibility(req, res) {
        try {
            const { id } = req.params;
            const { visible } = req.body;

            const comment = await commentsService.updateVisibility(id, visible);

            res.json({
                status: "success",
                message: "Comment visibility updated successfully",
                data: comment,
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: error.message,
            });
        }
    }
}

module.exports = new CommentsController();
