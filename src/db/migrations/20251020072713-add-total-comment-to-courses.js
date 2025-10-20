"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("courses", "total_comment", {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            after: "level",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("courses", "total_comment");
    },
};
