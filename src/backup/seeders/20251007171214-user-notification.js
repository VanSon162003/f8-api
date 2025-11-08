"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker");

        // Skip if table does not exist in current schema
        const tables = await queryInterface.showAllTables();
        const hasUserNotification = tables
            .map((t) => (typeof t === "string" ? t.toLowerCase() : String(t.tableName || t.name).toLowerCase()))
            .includes("user_notification");
        if (!hasUserNotification) {
            return;
        }

        const userNotifications = [];
        const usedPairs = new Set();
        for (let i = 1; i <= 100; i++) {
            const userId = faker.number.int({ min: 1, max: 20 });
            const notificationId = faker.number.int({ min: 1, max: 50 });
            const key = `${userId}:${notificationId}`;
            if (usedPairs.has(key)) continue;
            usedPairs.add(key);
            userNotifications.push({
                user_id: userId,
                notification_id: notificationId,
                read_at: faker.datatype.boolean() ? new Date() : null,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert(
            "user_notification",
            userNotifications,
            { ignoreDuplicates: true }
        );
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("user_notification", null, {});
    },
};
