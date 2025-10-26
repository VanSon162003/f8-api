"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("courses", "status", {
            type: Sequelize.ENUM("published", "draft"),
            allowNull: false,
            defaultValue: "draft",
            after: "level",
        });
    },

    async down(queryInterface, Sequelize) {
        // Cần xóa ENUM trước khi drop column
        await queryInterface.removeColumn("courses", "status");
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_courses_status";'
        );
    },
};
