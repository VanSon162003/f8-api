"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("access_token", {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            access_token: {
                type: Sequelize.STRING(512),
                allowNull: false,
            },
            deleted_at: {
                type: Sequelize.DATE,
                defaultValue: null,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal(
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                ),
            },
        });

        await queryInterface.addIndex("access_token", ["access_token"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("access_token");
    },
};
