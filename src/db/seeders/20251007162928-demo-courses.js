"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker/locale/vi");

        const courses = [];
        const courseTitles = [
            "Lập trình JavaScript cơ bản",
            "React.js từ cơ bản đến nâng cao",
            "Node.js & Express",
            "HTML CSS cơ bản",
            "MongoDB cho beginner",
            "Git & GitHub",
            "TypeScript",
            "Vue.js",
            "Next.js",
            "Testing với Jest",
        ];
        const usedSlugs = new Set();
        for (let i = 1; i <= 10; i++) {
            const titleBase = courseTitles[i - 1] || `${faker.word.noun()} ${faker.word.adjective()}`;
            let slug = faker.helpers.slugify(titleBase.toLowerCase());
            let suffix = 1;
            while (usedSlugs.has(slug)) {
                slug = `${slug}-${suffix}`.slice(0, 255);
                suffix++;
            }
            usedSlugs.add(slug);

            courses.push({
                title: titleBase,
                description: `${faker.word.words(8)}. ${faker.word.words(10)}.`,
                thumbnail: faker.image.url({ width: 400, height: 200 }),
                slug,
                what_you_learn: faker.word.words(6),
                requirement: "Kiến thức cơ bản về lập trình",
                level: faker.helpers.arrayElement([
                    "beginner",
                    "intermediate",
                    "advanced",
                ]),
                total_track: faker.number.int({ min: 3, max: 8 }),
                total_lesson: faker.number.int({ min: 20, max: 50 }),
                total_duration: faker.number.int({ min: 100, max: 500 }),
                is_pro: faker.datatype.boolean(),
                price: faker.number.float({ min: 0, max: 500000, precision: 0.01 }),
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("courses", courses, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("courses", null, {});
    },
};
