"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker/locale/vi");

        const newFeeds = [];
        for (let i = 1; i <= 15; i++) {
            const tail = `${faker.word.noun()} ${faker.word.adjective()} ${faker.word.verb()} ${faker.word.noun()} ${faker.word.adjective()}`;
            newFeeds.push({
                title: `News ${i}: ${tail}`,
                description: `${faker.word.words(18)}.`,
                content: `${faker.word.words(60)}. ${faker.word.words(55)}. ${faker.word.words(50)}.`,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("new_feed", newFeeds, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("new_feeds", null, {});
    },
};
