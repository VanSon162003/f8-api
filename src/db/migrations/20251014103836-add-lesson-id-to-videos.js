"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("videos", "lesson_id", {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: "lessons",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("videos", "lesson_id");
    },
};
