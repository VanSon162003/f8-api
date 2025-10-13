"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("lessons", "thumbnail", {
            type: Sequelize.STRING,
            allowNull: true,
            after: "title", // thêm sau trường title
        });

        await queryInterface.addColumn("lessons", "lesson_type", {
            type: Sequelize.ENUM("Video", "Lesson", "Challenge", "Question"),
            allowNull: false,
            defaultValue: "Lesson",
            after: "thumbnail",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("lessons", "thumbnail");
        await queryInterface.removeColumn("lessons", "lesson_type");
    },
};
