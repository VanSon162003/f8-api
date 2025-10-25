const likesService = require("@/service/api/likes.service");
const response = require("@/utils/response");

// Toggle like for a post
const toggleLike = async (req, res) => {
    try {
        const { likeableType, likeableId } = req.body;
        const data = await likesService.toggleLike(
            likeableType,
            likeableId,
            req.user.id,
            req.user
        );
        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

// Check if user liked a post
const checkUserLike = async (req, res) => {
    try {
        const { likeableType, likeableId } = req.query;
        const data = await likesService.checkUserLike(
            likeableType,
            likeableId,
            req.user.id
        );
        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

// Get like count for a post
const getLikeCount = async (req, res) => {
    try {
        const { likeableType, likeableId } = req.query;
        const data = await likesService.getLikeCount(likeableType, likeableId);
        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

module.exports = {
    toggleLike,
    checkUserLike,
    getLikeCount,
};
