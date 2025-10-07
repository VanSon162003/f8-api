"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker/locale/vi");

        const comments = [];
        for (let i = 1; i <= 100; i++) {
            const parentId = i > 1 && faker.datatype.boolean() ? faker.number.int({ min: 1, max: i - 1 }) : null;
            const commentableType = faker.helpers.arrayElement(["post", "question"]);
            const commentableId = faker.number.int({ min: 1, max: commentableType === "post" ? 50 : 30 });
            const content = `${faker.word.words(10)}.`;
            comments.push({
                user_id: faker.number.int({ min: 1, max: 20 }),
                parent_id: parentId,
                commentable_type: commentableType,
                commentable_id: commentableId,
                like_count: faker.number.int({ min: 0, max: 20 }),
                content,
                deleted_at: null,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("comments", comments, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("comments", null, {});
    },
};
