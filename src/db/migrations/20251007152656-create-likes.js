"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("likes", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            user_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            likeable_type: {
                type: Sequelize.STRING(50),
            },
            likeable_id: {
                type: Sequelize.INTEGER,
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
        await queryInterface.addIndex("likes", ["user_id"], {
            name: "idx_likes_user_id",
        });
        await queryInterface.addIndex(
            "likes",
            ["likeable_type", "likeable_id"],
            {
                name: "idx_likes_likeable",
            }
        );
        await queryInterface.addIndex(
            "likes",
            ["user_id", "likeable_type", "likeable_id"],
            {
                name: "idx_likes_user_likeable",
                unique: true,
            }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("likes");
    },
};
