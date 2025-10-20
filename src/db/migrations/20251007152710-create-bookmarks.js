"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("bookmarks", {
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
            post_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: "posts",
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
        await queryInterface.addIndex("bookmarks", ["user_id"], {
            name: "idx_bookmarks_user_id",
        });
        await queryInterface.addIndex("bookmarks", ["post_id"], {
            name: "idx_bookmarks_post_id",
        });
        await queryInterface.addIndex("bookmarks", ["user_id", "post_id"], {
            name: "idx_bookmarks_user_post",
            unique: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("bookmarks");
    },
};
