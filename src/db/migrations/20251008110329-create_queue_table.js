"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("queue", {
            id: {
                type: Sequelize.INTEGER({ unsigned: true }),
                autoIncrement: true,
                primaryKey: true,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            status: {
                type: Sequelize.STRING,
                defaultValue: "pending",
            },
            payload: {
                type: Sequelize.JSON,
                allowNull: false,
            },
            max_retries: {
                type: Sequelize.INTEGER,
                defaultValue: 5,
            },
            retries_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            retried_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("queue");
    },
};
