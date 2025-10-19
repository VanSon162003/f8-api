const {
    Notification,
    UserNotification,
    Post,
    User,
    Comment,
} = require("@/db/models");
const pusher = require("@/config/pusher");
const { where } = require("sequelize");

class NotificationService {
    async read(data, currentUser) {
        if (!currentUser) throw new Error("Bạn cần đăng nhập để đọc thông báo");

        const ids = Array.isArray(data.data.ids)
            ? data.data.ids
            : [data.data.id].filter(Boolean); // hỗ trợ cả 1 id lẻ

        if (!ids.length) throw new Error("Danh sách thông báo không hợp lệ");

        // Lấy tất cả UserNotification thuộc user và có id trong danh sách
        const userNotifications = await UserNotification.findAll({
            where: {
                user_id: currentUser.id,
                notification_id: ids,
            },
        });

        if (userNotifications.length === 0)
            throw new Error("Không tìm thấy thông báo hợp lệ");

        // Cập nhật tất cả read_at
        await Promise.all(
            userNotifications.map(async (un) => {
                un.read_at = new Date();
                return un.save();
            })
        );

        return {
            success: true,
            message: `Đã đọc ${userNotifications.length} thông báo`,
            count: userNotifications.length,
            readIds: userNotifications.map((u) => u.notification_id),
        };
    }

    async createNotification({
        type,
        title,
        to,
        notifiableType,
        notifiableId,
        userId,
        content,
    }) {
        try {
            const notification = await Notification.create({
                type,
                title,
                to,
                notifiable_type: notifiableType,
                notifiable_id: notifiableId,
            });

            await UserNotification.create({
                user_id: userId,
                notification_id: notification.id,
                read_at: null,
            });

            return notification;
        } catch (error) {
            console.error("Error creating notification:", error);
            throw error;
        }
    }

    async sendReactionNotification(data, currentUser) {
        try {
            const { type, targetId, targetType } = data;
            let targetUser, notificationData;

            switch (targetType) {
                case "post": {
                    const post = await Post.findByPk(targetId);
                    if (!post || post.user_id === currentUser.id) return;

                    notificationData = {
                        type: "post_reaction",
                        title: `${currentUser.full_name} đã thích bài viết của bạn`,
                        to: `/blog/${post.slug}`,
                        notifiableType: "Post",
                        notifiableId: post.id,
                        userId: post.user_id,
                        content: null,
                    };
                    targetUser = post.user_id;
                    break;
                }
                case "comment": {
                    const comment = await Comment.findByPk(targetId);

                    if (!comment || comment.user_id === currentUser.id) return;

                    // Build the notification URL based on the commentable type
                    let notificationUrl;
                    if (data.commentableType === "post" && data.postSlug) {
                        notificationUrl = `/blog/${data.postSlug}#comment-${comment.id}`;
                    } else {
                        // Default URL or handle other commentable types
                        notificationUrl = `#comment-${comment.id}`;
                    }

                    const post = await Post.findOne({
                        where: { slug: data.postSlug },
                    });

                    notificationData = {
                        type: "comment_react",
                        title: `${currentUser.full_name} đã ${
                            data.reactionLabel || "thích"
                        } tin nhắn của bạn`,
                        to: notificationUrl,
                        notifiableType: "Comment",
                        notifiableId: comment.id,
                        userId: post.user_id,
                        content: comment.content,
                    };
                    targetUser = comment.user_id;
                    break;
                }
            }

            if (!notificationData) return;

            const notification = await this.createNotification(
                notificationData
            );

            // Send real-time notification via Pusher
            await pusher.trigger(`joinNotificationRoom`, "notification", {
                id: notification.id,
                type: notification.type,
                title: notification.title,
                to: notification.to,
                content: notificationData.content,
                notifiable_type: notification.notifiable_type,
                notifiable_id: notification.notifiable_id,
                createdAt: notification.createdAt,
                updatedAt: notification.updatedAt,
                userId: notificationData.userId,
                UserNotification: {
                    read_at: null,
                    createdAt: new Date(),
                },
                user: currentUser,
            });

            return notification;
        } catch (error) {
            console.error("Error sending reaction notification:", error);
            throw error;
        }
    }

    async sendReplyNotification(comment, currentUser) {
        try {
            if (!comment.parent_id) return; // Not a reply

            const parentComment = await Comment.findByPk(comment.parent_id);
            if (!parentComment || parentComment.user_id === currentUser.id)
                return;

            // Build notification URL based on the commentable type
            let notificationUrl;
            let userId = null;
            if (comment.commentable_type === "post") {
                const post = await Post.findByPk(comment.commentable_id);
                userId = post.user_id;
                if (post) {
                    notificationUrl = `/blog/${post.slug}#comment-${comment.id}`;
                }
            }

            // Default URL if not a post or post not found
            if (!notificationUrl) {
                notificationUrl = `#comment-${comment.id}`;
            }

            const notificationData = {
                type: "comment_reply",
                title: `${currentUser.full_name} đã trả lời bình luận của bạn`,
                to: notificationUrl,
                notifiableType: "Comment",
                notifiableId: comment.id,
                userId: parentComment.user_id,
                content: comment.content,
            };

            const notification = await this.createNotification(
                notificationData
            );

            // Send real-time notification
            await pusher.trigger(`joinNotificationRoom`, "notification", {
                id: notification.id,
                type: notification.type,
                title: notification.title,
                to: notification.to,
                content: comment.content,
                notifiable_type: notification.notifiable_type,
                notifiable_id: notification.notifiable_id,
                createdAt: notification.createdAt,
                updatedAt: notification.updatedAt,
                userId,
                UserNotification: {
                    read_at: null,
                    createdAt: new Date(),
                },
                user: currentUser,
            });

            return notification;
        } catch (error) {
            console.error("Error sending reply notification:", error);
            throw error;
        }
    }

    async sendPostSaveNotification(post, currentUser) {
        try {
            if (post.user_id === currentUser.id) return;

            const notificationData = {
                type: "post_save",
                title: `${currentUser.full_name} đã lưu bài viết của bạn`,
                to: `/blog/${post.slug}`,
                notifiableType: "Post",
                notifiableId: post.id,
                userId: post.user_id,
                content: null,
            };

            const notification = await this.createNotification(
                notificationData
            );

            // Send real-time notification
            await pusher.trigger(`joinNotificationRoom`, "notification", {
                id: notification.id,
                type: notification.type,
                title: notification.title,
                to: notification.to,
                notifiable_type: notification.notifiable_type,
                notifiable_id: notification.notifiable_id,
                createdAt: notification.createdAt,
                updatedAt: notification.updatedAt,
                UserNotification: {
                    read_at: null,
                    createdAt: new Date(),
                },
                userId: post.user_id,
                user: currentUser,
            });

            return notification;
        } catch (error) {
            console.error("Error sending post save notification:", error);
            throw error;
        }
    }

    async sendFollowNotification(targetUserId, currentUser) {
        try {
            const targetUser = await User.findByPk(targetUserId);
            if (!targetUser || targetUser.id === currentUser.id) return;

            const notificationData = {
                type: "follow",
                title: `${currentUser.full_name} đã bắt đầu theo dõi bạn`,
                to: `/@${currentUser.username}`,
                notifiableType: "User",
                notifiableId: currentUser.id,
                userId: targetUser.id,
                content: null,
            };

            const notification = await this.createNotification(
                notificationData
            );

            // Send real-time notification
            await pusher.trigger(`joinNotificationRoom`, "notification", {
                id: notification.id,
                type: notification.type,
                title: notification.title,
                to: notification.to,
                notifiable_type: notification.notifiable_type,
                notifiable_id: notification.notifiable_id,
                createdAt: notification.createdAt,
                updatedAt: notification.updatedAt,
                UserNotification: {
                    read_at: null,
                    createdAt: new Date(),
                },
                userId: targetUser.id,
                user: currentUser,
            });

            return notification;
        } catch (error) {
            console.error("Error sending follow notification:", error);
            throw error;
        }
    }
}

module.exports = new NotificationService();
