"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker");

        const bookmarks = [];
        const usedPairs = new Set();
        for (let i = 1; i <= 50; i++) {
            const userId = faker.number.int({ min: 1, max: 20 });
            const postId = faker.number.int({ min: 1, max: 50 });
            const key = `${userId}:${postId}`;
            if (usedPairs.has(key)) continue;
            usedPairs.add(key);
            bookmarks.push({
                user_id: userId,
                post_id: postId,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("bookmarks", bookmarks, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("bookmarks", null, {});
    },
};
