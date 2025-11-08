"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker/locale/vi");

        const tags = [];
        const tagNames = [
            "beginner",
            "tutorial",
            "advanced",
            "bug",
            "tip",
            "project",
        ];
        const usedNames = new Set();
        for (let i = 1; i <= 20; i++) {
            const base =
                tagNames[(i - 1) % tagNames.length] || faker.word.noun();
            let name = base;
            let suffix = 1;
            while (usedNames.has(name)) {
                name = `${base}-${suffix}`.slice(0, 50);
                suffix++;
            }
            usedNames.add(name);
            tags.push({
                name,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("tags", tags, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("tags", null, {});
    },
};
