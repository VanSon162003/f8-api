"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker/locale/vi");

        const tracks = [];
        for (let i = 1; i <= 30; i++) {
            const courseId = Math.ceil(i / 3);
            const titleTail = `${faker.word.noun()} ${faker.word.adjective()} ${faker.word.verb()}`;
            const title = `Track ${i}: ${titleTail}`;
            const baseSlug = `track-${i}-${faker.helpers.slugify(titleTail.toLowerCase())}`;
            tracks.push({
                course_id: courseId,
                title,
                slug: baseSlug,
                total_lesson: faker.number.int({ min: 5, max: 15 }),
                total_duration: faker.number.int({ min: 30, max: 100 }),
                position: (i % 10) + 1,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("track", tracks, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("track", null, {});
    },
};
