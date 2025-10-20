"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("learning_path", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            title: {
                type: Sequelize.STRING(255),
            },
            slug: {
                type: Sequelize.STRING(255),
                unique: true,
            },
            description: {
                type: Sequelize.STRING(255),
            },
            thumbnail: {
                type: Sequelize.STRING(255),
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

        // Indexes
        await queryInterface.addIndex("learning_path", ["slug"], {
            name: "idx_learning_path_slug",
            unique: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("learning_path");
    },
};
