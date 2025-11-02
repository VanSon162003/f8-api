const postsService = require("../../service/admin/posts.service");

class PostsController {
    // Get all posts with pagination
    async getAllPosts(req, res) {
        try {
            const { page = 1, limit = 10, search = "" } = req.query;
            const result = await postsService.getAllPosts(page, limit, search);
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

    // Update post approve status
    async updateApproveStatus(req, res) {
        try {
            const { id } = req.params;
            const { is_approved } = req.body;

            await postsService.updateApproveStatus(id, is_approved);

            res.json({
                status: "success",
                message: "Post approval status updated successfully",
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: error.message,
            });
        }
    }

    // Delete post
    async deletePost(req, res) {
        try {
            const { id } = req.params;
            await postsService.deletePost(id);

            res.json({
                status: "success",
                message: "Post deleted successfully",
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: error.message,
            });
        }
    }

    // Approve all posts
    async approveAllPosts(req, res) {
        try {
            const result = await postsService.approveAllPosts();

            res.json({
                status: "success",
                message: result.message,
                data: {
                    updatedCount: result.updatedCount,
                },
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: error.message,
            });
        }
    }
}

module.exports = new PostsController();
