const { UserNotification, Notification, Post } = require("@/db/models");
const pusher = require("@/config/pusher");

class PusherService {
    async follow(data, currentUser) {
        try {
            const notification = await Notification.create({
                type: "follow",
                title: `${currentUser.fullname} has started following you`,
                message: `${currentUser.fullname} has started following you`,
                link: `/profile/${currentUser.username}`,
                notifiable_type: "Follow",
                notifiable_id: currentUser.id,
            });

            await UserNotification.create({
                user_id: data.recipientId,
                notification_id: notification.id,
                read_at: null,
            });

            // 3. Gửi real-time bằng Pusher
            await pusher.trigger(
                `follow-${data.recipientId}`,
                "notification-new-follow",
                {
                    id: notification.id,
                    type: "follow",
                    title: `${currentUser.fullname} has started following you`,
                    message: `${currentUser.fullname} has started following you`,
                    link: `/profile/${currentUser.username}`,
                    notifiable_type: "follow",
                    notifiable_id: currentUser.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),

                    UserNotification: {
                        read_at: null,
                        createdAt: new Date(),
                    },
                }
            );
        } catch (error) {}

        return true;
    }

    async likePost(data, currentUser) {
        if (currentUser.id === data.recipientId) return;

        try {
            const notification = await Notification.create({
                type: "like",
                title: `${currentUser.fullname} liked your post`,
                message: `${currentUser.fullname} liked your post`,
                link: `blog/${data.post.slug}`,
                notifiable_type: "Like",
                notifiable_id: data.post.id,
            });

            await UserNotification.create({
                user_id: data.recipientId,
                notification_id: notification.id,
                read_at: null,
            });

            // 3. Gửi real-time bằng Pusher
            await pusher.trigger(`like-post`, "notification-new-like-post", {
                id: notification.id,
                type: "like",
                title: `${currentUser.fullname} liked your post`,
                message: `${currentUser.fullname} liked your post`,
                link: `blog/${data.post.slug}`,
                notifiable_type: "Like",
                notifiable_id: data.post.id,
                createdAt: new Date(),
                updatedAt: new Date(),

                user_id: currentUser.id,

                UserNotification: {
                    read_at: null,
                    createAt: new Date(),
                },
            });
        } catch (error) {}

        return true;
    }

    async sendComment(data, currentUser, comment, course) {
        const post = await Post.findByPk(data.id);

        if (currentUser.id === post.user_id) return;

        try {
            const notification = await Notification.create({
                notifiable_type: data.type === "post" ? "Post" : "Question",
                notifiable_id: data.id,
                type:
                    data.type === "post" ? "comment_post" : "comment_question",
                title: `${currentUser.full_name} đã bình luận ${
                    data.type === "post" ? "bài viết" : "khoá học"
                } của bạn`,
                to:
                    data.type === "post"
                        ? `/blog/${post.slug}#${currentUser.username}`
                        : `/learning/${course.slug}#${currentUser.username}`,
            });

            await UserNotification.create({
                user_id:
                    data.type === "post" ? post.user_id : course.creator_id,
                notification_id: notification.id,
                read_at: null,
            });

            // 3. Gửi real-time bằng Pusher
            await pusher.trigger(
                `comment-post-${post.id}`,
                "notification-new-comment-post",
                {
                    id: notification.id,
                    comment_id: comment.id,
                    type: notification.type,
                    title: `${currentUser.full_name} đã bình luận ${
                        data.type === "post" ? "bài viết" : "khoá học"
                    } của bạn`,
                    content: comment.content,
                    link:
                        data.type === "post"
                            ? `/blog/${post.slug}#${currentUser.username}`
                            : `/learning/${course.slug}#${currentUser.username}`,
                    notifiable_type: notification.type,
                    notifiable_id: notification.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),

                    UserNotification: currentUser.toJSON(),
                    user_id: post.user_id,
                }
            );

            await pusher.trigger(`joinNotificationRoom`, "notification", {
                id: notification.id,
                comment_id: comment.id,
                type: notification.type,
                title: `${currentUser.full_name} đã bình luận ${
                    data.type === "post" ? "bài viết" : "khoá học"
                } của bạn`,
                to:
                    data.type === "post"
                        ? `/blog/${post.slug}#${currentUser.username}`
                        : `/learning/${course.slug}#${currentUser.username}`,

                content: comment.content,
                link:
                    data.type === "post"
                        ? `/blog/${post.slug}#${currentUser.username}`
                        : `/learning/${course.slug}#${currentUser.username}`,
                notifiable_type: notification.type,
                notifiable_id: notification.id,
                createdAt: new Date(),
                updatedAt: new Date(),

                UserNotification: currentUser.toJSON(),
                userId: data.type === "post" ? post.user_id : course.creator_id,
            });
            console.log(123);
        } catch (error) {
            console.log(error);
        }

        return true;
    }
}

module.exports = new PusherService();
