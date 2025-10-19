const { User, Follow } = require("@/db/models");
const { updateUserActivity } = require("./auth.service");
const notificationsService = require("./notifications.service");

class FollowService {
    async followUser(followerId, followedId) {
        try {
            if (followerId === followedId) {
                throw new Error("Bạn không thể tự theo dõi chính mình");
            }

            // Check if already following
            const existingFollow = await Follow.findOne({
                where: {
                    follower_id: followerId,
                    followed_id: followedId
                }
            });

            if (existingFollow) {
                // Unfollow
                await existingFollow.destroy();
                await updateUserActivity(followerId, 'unfollow_user');
                return {
                    following: false,
                    message: "Đã huỷ theo dõi thành công"
                };
            }

            // Create new follow
            await Follow.create({
                follower_id: followerId,
                followed_id: followedId
            });

            // Get both users for notification
            const [currentUser, followedUser] = await Promise.all([
                User.findByPk(followerId),
                User.findByPk(followedId)
            ]);

            // Send notification
            if (currentUser && followedUser) {
                await notificationsService.sendFollowNotification(followedUser, currentUser);
            }

            await updateUserActivity(followerId, 'follow_user');

            return {
                following: true,
                message: "Đã theo dõi thành công"
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async checkFollowing(followerId, followedId) {
        try {
            const follow = await Follow.findOne({
                where: {
                    follower_id: followerId,
                    followed_id: followedId
                }
            });

            return {
                following: !!follow
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getFollowers(userId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;

            const { count, rows } = await Follow.findAndCountAll({
                where: {
                    followed_id: userId
                },
                include: [{
                    model: User,
                    as: 'follower',
                    attributes: ['id', 'username', 'full_name', 'avatar']
                }],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                followers: rows.map(row => row.follower),
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: limit
                }
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getFollowing(userId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;

            const { count, rows } = await Follow.findAndCountAll({
                where: {
                    follower_id: userId
                },
                include: [{
                    model: User,
                    as: 'followed',
                    attributes: ['id', 'username', 'full_name', 'avatar']
                }],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                following: rows.map(row => row.followed),
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: limit
                }
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = new FollowService();