"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker");

        const activities = [];
        const types = ["lesson", "post", "comment", "quiz", "login", "all"];
        for (let i = 1; i <= 100; i++) {
            activities.push({
                user_id: faker.number.int({ min: 1, max: 20 }),
                activity_date: new Date(),
                activity_count: faker.number.int({ min: 1, max: 10 }),
                activity_type: faker.helpers.arrayElement(types),
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("user_activities", activities, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("user_activities", null, {});
    },
};
