"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker/locale/vi");

        const settings = [];
        for (let i = 1; i <= 20; i++) {
            settings.push({
                user_id: i,
                data: JSON.stringify({
                    theme: "dark",
                    notifications: true,
                    language: "vi",
                    privacy: "public",
                }),
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("user_setting", settings, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("user_setting", null, {});
    },
};
