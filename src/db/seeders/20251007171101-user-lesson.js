"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker");

        const userLessons = [];
        const usedPairs = new Set();
        for (let i = 1; i <= 200; i++) {
            const userId = faker.number.int({ min: 1, max: 20 });
            const lessonId = faker.number.int({ min: 1, max: 100 });
            const key = `${userId}:${lessonId}`;
            if (usedPairs.has(key)) continue;
            usedPairs.add(key);
            userLessons.push({
                user_id: userId,
                lesson_id: lessonId,
                completed: faker.datatype.boolean(),
                completed_at: faker.datatype.boolean() ? new Date() : null,
                watch_duration: faker.number.int({ min: 0, max: 1800 }),
                last_position: faker.number.int({ min: 0, max: 1800 }),
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("user_lesson", userLessons, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("user_lesson", null, {});
    },
};
