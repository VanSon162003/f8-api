"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker");

        const follows = [];
        const usedPairs = new Set();
        for (let i = 1; i <= 100; i++) {
            const follower = faker.number.int({ min: 1, max: 20 });
            let followee = faker.number.int({ min: 1, max: 20 });
            if (followee === follower) continue;
            const key = `${follower}:${followee}`;
            if (usedPairs.has(key)) continue;
            usedPairs.add(key);
            follows.push({
                following_id: follower,
                followed_id: followee,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("follows", follows, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("follows", null, {});
    },
};
