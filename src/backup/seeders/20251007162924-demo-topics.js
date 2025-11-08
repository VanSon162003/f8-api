"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker/locale/vi");

        const topics = [
            {
                name: "JavaScript",
                slug: "javascript",
                image: faker.image.url({ width: 200 }),
                description: "Ngôn ngữ lập trình phổ biến",
                posts_count: 20,
            },
            {
                name: "React",
                slug: "react",
                image: faker.image.url({ width: 200 }),
                description: "Framework UI",
                posts_count: 15,
            },
            {
                name: "Node.js",
                slug: "nodejs",
                image: faker.image.url({ width: 200 }),
                description: "Backend JS",
                posts_count: 10,
            },
            {
                name: "CSS",
                slug: "css",
                image: faker.image.url({ width: 200 }),
                description: "Styling",
                posts_count: 8,
            },
            // Thêm 6 topics nữa với faker
        ];
        for (let i = 5; i <= 10; i++) {
            const name = `${faker.word.noun()} ${faker.word.adjective()}`;
            topics.push({
                name,
                slug: faker.helpers.slugify(name.toLowerCase()),
                image: faker.image.url({ width: 200 }),
                description: faker.lorem.sentence(),
                posts_count: faker.number.int({ min: 5, max: 20 }),
            });
        }
        for (let topic of topics) {
            topic.created_at = new Date();
            topic.updated_at = new Date();
        }
        await queryInterface.bulkInsert("topics", topics, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("topics", null, {});
    },
};
