"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("Slides", "url", {
            type: Sequelize.STRING,
            allowNull: true,
            after: "image", // Thêm cột url sau cột image
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("Slides", "url");
    },
};
