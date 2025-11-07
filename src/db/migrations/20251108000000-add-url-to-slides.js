"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("slides", "url", {
            type: Sequelize.STRING,
            allowNull: true,
            after: "image", // Thêm cột url sau cột image
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("slides", "url");
    },
};
