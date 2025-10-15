const { Bookmark, Post, User } = require("@models");

// Toggle bookmark for a post
const toggleBookmark = async (postId, userId) => {
    try {
        // Check if user already bookmarked this post
        const existingBookmark = await Bookmark.findOne({
            where: {
                user_id: userId,
                post_id: postId,
            },
        });

        if (existingBookmark) {
            // Remove bookmark
            await existingBookmark.destroy();
            return {
                bookmarked: false,
                message: "Bookmark removed successfully",
            };
        } else {
            // Add bookmark
            await Bookmark.create({
                user_id: userId,
                post_id: postId,
            });
            return { bookmarked: true, message: "Bookmarked successfully" };
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

// Check if user bookmarked a post
const checkUserBookmark = async (postId, userId) => {
    try {
        const bookmark = await Bookmark.findOne({
            where: {
                user_id: userId,
                post_id: postId,
            },
        });

        return { bookmarked: !!bookmark };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Get user's bookmarked posts
const getUserBookmarks = async (userId, page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;

        const { count, rows } = await Bookmark.findAndCountAll({
            where: { user_id: userId },
            include: [
                {
                    model: Post,
                    as: "post",
                    include: [
                        {
                            model: User,
                            as: "author",
                            attributes: [
                                "id",
                                "full_name",
                                "username",
                                "avatar",
                            ],
                        },
                    ],
                },
            ],
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true,
        });

        const totalPages = Math.ceil(count / limit);

        return {
            bookmarks: rows.map((bookmark) => bookmark.post),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: count,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    toggleBookmark,
    checkUserBookmark,
    getUserBookmarks,
};
