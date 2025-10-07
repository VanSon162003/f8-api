"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker/locale/vi");

        const notes = [];
        const usedPairs = new Set();
        for (let i = 1; i <= 50; i++) {
            const userId = faker.number.int({ min: 1, max: 20 });
            const lessonId = faker.number.int({ min: 1, max: 100 });
            const key = `${userId}:${lessonId}`;
            if (usedPairs.has(key)) continue;
            usedPairs.add(key);
            notes.push({
                user_id: userId,
                lesson_id: lessonId,
                content: `${faker.word.words(20)}. ${faker.word.words(18)}.`,
                video_timestamp: faker.number.int({ min: 0, max: 1800 }),
                is_pinned: faker.datatype.boolean(),
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("notes", notes, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("notes", null, {});
    },
};
