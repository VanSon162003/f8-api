"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        const reactions = [
            { id: 1, icon: "👍", label: "Thích" },
            { id: 2, icon: "❤️", label: "Yêu thích" },
            { id: 3, icon: "😂", label: "Haha" },
            { id: 4, icon: "😮", label: "Wow" },
            { id: 5, icon: "😢", label: "Buồn" },
            { id: 6, icon: "😡", label: "Phẫn nộ" },
        ];

        const now = new Date();

        await queryInterface.bulkInsert(
            "reaction_types",
            reactions.map((r) => ({
                id: r.id,
                label: r.label,
                icon: r.icon,
                created_at: now,
                updated_at: now,
            }))
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("reaction_types", null, {});
    },
};
