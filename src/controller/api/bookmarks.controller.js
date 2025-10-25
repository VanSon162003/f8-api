const bookmarksService = require("@/service/api/bookmarks.service");
const response = require("@/utils/response");

// Toggle bookmark for a post
const toggleBookmark = async (req, res) => {
    try {
        const { postId } = req.body;
        const data = await bookmarksService.toggleBookmark(
            postId,
            req.user.id,
            req.user
        );
        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

// Check if user bookmarked a post
const checkUserBookmark = async (req, res) => {
    try {
        const { postId } = req.query;
        const data = await bookmarksService.checkUserBookmark(
            postId,
            req.user.id
        );
        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

// Get user's bookmarked posts
const getUserBookmarks = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const data = await bookmarksService.getUserBookmarks(
            req.user.id,
            parseInt(page),
            parseInt(limit)
        );
        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

module.exports = {
    toggleBookmark,
    checkUserBookmark,
    getUserBookmarks,
};
