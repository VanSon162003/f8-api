"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker/locale/vi");

        const paths = [];
        const pathTitles = [
            "Fullstack Web Developer",
            "Frontend Mastery",
            "Backend Node.js",
            "Mobile React Native",
        ];
        const usedSlugs = new Set();
        for (let i = 1; i <= 5; i++) {
            const titleBase = pathTitles[i - 1] || `${faker.word.noun()} ${faker.word.adjective()}`;
            let slug = faker.helpers.slugify(titleBase.toLowerCase());
            let suffix = 1;
            while (usedSlugs.has(slug)) {
                slug = `${slug}-${suffix}`.slice(0, 255);
                suffix++;
            }
            usedSlugs.add(slug);

            paths.push({
                title: titleBase,
                slug,
                description: faker.word.words(10),
                thumbnail: faker.image.url({ width: 200 }),
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("learning_path", paths, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("learning_path", null, {});
    },
};
