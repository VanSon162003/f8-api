"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker/locale/vi");

        const questions = [];
        for (let i = 1; i <= 30; i++) {
            const tail = `${faker.word.noun()} ${faker.word.adjective()} ${faker.word.verb()} ${faker.word.noun()} ${faker.word.adjective()}`;
            questions.push({
                user_id: faker.number.int({ min: 1, max: 20 }),
                lesson_id: faker.number.int({ min: 1, max: 100 }),
                course_id: faker.number.int({ min: 1, max: 10 }),
                title: `Câu hỏi: ${tail}`,
                category: faker.helpers.arrayElement(["theory", "bug_report", "off_topic"]),
                content: `${faker.word.words(30)}. ${faker.word.words(25)}.`,
                answers_count: faker.number.int({ min: 0, max: 10 }),
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("quesions", questions, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("quesions", null, {});
    },
};
