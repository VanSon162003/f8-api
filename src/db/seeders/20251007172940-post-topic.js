"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker");

        const postTopics = [];
        const usedPairs = new Set();
        for (let i = 1; i <= 100; i++) {
            const topicId = faker.number.int({ min: 1, max: 10 });
            const postId = faker.number.int({ min: 1, max: 50 });
            const key = `${topicId}:${postId}`;
            if (usedPairs.has(key)) continue;
            usedPairs.add(key);
            postTopics.push({
                topic_id: topicId,
                post_id: postId,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("post_topic", postTopics, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("post_topics", null, {});
    },
};
