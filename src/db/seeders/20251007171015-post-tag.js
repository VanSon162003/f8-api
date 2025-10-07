"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker");

        const postTags = [];
        const usedPairs = new Set();
        for (let i = 1; i <= 150; i++) {
            const postId = faker.number.int({ min: 1, max: 50 });
            const tagId = faker.number.int({ min: 1, max: 20 });
            const key = `${postId}:${tagId}`;
            if (usedPairs.has(key)) continue;
            usedPairs.add(key);
            postTags.push({
                post_id: postId,
                tag_id: tagId,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("post_tag", postTags, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("post_tag", null, {});
    },
};
