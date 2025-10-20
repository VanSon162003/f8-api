"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("follows", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            following_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            followed_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
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
        await queryInterface.addIndex("follows", ["following_id"], {
            name: "idx_follows_following_id",
        });
        await queryInterface.addIndex("follows", ["followed_id"], {
            name: "idx_follows_followed_id",
        });
        await queryInterface.addIndex(
            "follows",
            ["following_id", "followed_id"],
            {
                name: "idx_follows_following_followed",
                unique: true,
            }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("follows");
    },
};
