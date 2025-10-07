"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker/locale/vi");

        const notifications = [];
        const types = ["like", "comment", "follow", "course_complete"];
        for (let i = 1; i <= 50; i++) {
            const type = faker.helpers.arrayElement(types);
            const actor = `${faker.person.firstName()} ${faker.person.lastName()}`;
            const title =
                type === "like"
                    ? `${actor} đã thích bài viết của bạn`
                    : type === "comment"
                    ? `${actor} đã bình luận vào bài viết`
                    : type === "follow"
                    ? `${actor} đã theo dõi bạn`
                    : `${actor} đã hoàn thành một khóa học`;
            notifications.push({
                type,
                title,
                notifiable_type: "user",
                notifiable_id: faker.number.int({ min: 1, max: 20 }),
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("notifications", notifications, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("notifications", null, {});
    },
};
