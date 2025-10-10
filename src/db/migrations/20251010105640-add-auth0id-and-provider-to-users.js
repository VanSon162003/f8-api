"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("users", "auth0_id", {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true,
            after: "id",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("users", "auth0_id");
    },
};
