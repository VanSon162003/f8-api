"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("notifications", "to", {
            type: Sequelize.STRING(255),
            allowNull: true,
            after: "type",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("notifications", "to");
    },
};
