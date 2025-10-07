"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker");

        const likes = [];
        const usedPairs = new Set();
        for (let i = 1; i <= 200; i++) {
            const likeableType = faker.helpers.arrayElement(["post", "comment"]);
            const likeableMax = likeableType === "post" ? 50 : 100;
            const likeableId = faker.number.int({ min: 1, max: likeableMax });
            const userId = faker.number.int({ min: 1, max: 20 });
            const key = `${userId}:${likeableType}:${likeableId}`;
            if (usedPairs.has(key)) continue;
            usedPairs.add(key);
            likes.push({
                user_id: userId,
                likeable_type: likeableType,
                likeable_id: likeableId,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("likes", likes, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("likes", null, {});
    },
};
