"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker/locale/vi");

        const posts = [];
        const usedSlugs = new Set();
        for (let i = 1; i <= 50; i++) {
            const userId = faker.number.int({ min: 1, max: 20 });
            const titleTail = `${faker.word.noun()} ${faker.word.adjective()} ${faker.word.verb()} ${faker.word.noun()} ${faker.word.adjective()}`;
            const title = `Hỏi đáp: ${titleTail}`;
            let slug = `post-${i}-${faker.helpers.slugify(titleTail.toLowerCase())}`;
            let suffix = 1;
            while (usedSlugs.has(slug)) {
                slug = `${slug}-${suffix}`.slice(0, 255);
                suffix++;
            }
            usedSlugs.add(slug);
            posts.push({
                user_id: userId,
                title,
                slug,
                thumbnail: faker.image.url({ width: 800 }),
                description: `${faker.word.words(10)}.`,
                meta_title: title,
                meta_description: `${faker.word.words(12)}.`,
                content: `${faker.word.words(50)}. ${faker.word.words(60)}. ${faker.word.words(40)}.`,
                status: "published",
                visibility: "public",
                views_count: faker.number.int({ min: 0, max: 1000 }),
                likes_count: faker.number.int({ min: 0, max: 50 }),
                published_at: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("posts", posts, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("posts", null, {});
    },
};
