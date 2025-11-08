"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        const commentReactions = [
            // User 1 👍 comment 1
            {
                user_id: 1,
                comment_id: 1,
                reaction_type_id: 1, // 👍 Thích
                created_at: now,
                updated_at: now,
            },
            // User 2 ❤️ comment 1
            {
                user_id: 2,
                comment_id: 1,
                reaction_type_id: 2, // ❤️ Yêu thích
                created_at: now,
                updated_at: now,
            },
            // User 3 😂 comment 2
            {
                user_id: 3,
                comment_id: 2,
                reaction_type_id: 3, // 😂 Haha
                created_at: now,
                updated_at: now,
            },
            // User 1 😮 comment 3
            {
                user_id: 1,
                comment_id: 3,
                reaction_type_id: 4, // 😮 Wow
                created_at: now,
                updated_at: now,
            },
            // User 2 👍 comment 3
            {
                user_id: 2,
                comment_id: 3,
                reaction_type_id: 1, // 👍 Thích
                created_at: now,
                updated_at: now,
            },
        ];

        await queryInterface.bulkInsert(
            "comment_reactions",
            commentReactions,
            {}
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("comment_reactions", null, {});
    },
};
