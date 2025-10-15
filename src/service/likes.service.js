const { Like } = require('@models');

// Toggle like for a post
const toggleLike = async (likeableType, likeableId, userId) => {
    try {
        // Check if user already liked this post
        const existingLike = await Like.findOne({
            where: {
                user_id: userId,
                likeable_type: likeableType,
                likeable_id: likeableId
            }
        });

        if (existingLike) {
            // Unlike - remove the like
            await existingLike.destroy();
            return { liked: false, message: 'Unliked successfully' };
        } else {
            // Like - create new like
            await Like.create({
                user_id: userId,
                likeable_type: likeableType,
                likeable_id: likeableId
            });
            return { liked: true, message: 'Liked successfully' };
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

// Check if user liked a post
const checkUserLike = async (likeableType, likeableId, userId) => {
    try {
        const like = await Like.findOne({
            where: {
                user_id: userId,
                likeable_type: likeableType,
                likeable_id: likeableId
            }
        });

        return { liked: !!like };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Get like count for a post
const getLikeCount = async (likeableType, likeableId) => {
    try {
        const count = await Like.count({
            where: {
                likeable_type: likeableType,
                likeable_id: likeableId
            }
        });

        return { count };
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    toggleLike,
    checkUserLike,
    getLikeCount
};
