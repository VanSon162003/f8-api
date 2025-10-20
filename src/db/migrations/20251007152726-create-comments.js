"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("comments", {
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
            parent_id: {
                type: Sequelize.INTEGER,
                defaultValue: null,
                references: {
                    model: "comments",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            commentable_type: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            commentable_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            like_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            content: {
                type: Sequelize.TEXT,
            },
            deleted_at: {
                type: Sequelize.DATE,
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
        await queryInterface.addIndex("comments", ["user_id"], {
            name: "idx_comments_user_id",
        });
        await queryInterface.addIndex("comments", ["parent_id"], {
            name: "idx_comments_parent_id",
        });
        await queryInterface.addIndex(
            "comments",
            ["commentable_type", "commentable_id"],
            {
                name: "idx_comments_commentable",
            }
        );
        await queryInterface.addIndex("comments", ["created_at"], {
            name: "idx_comments_created_at",
        });
        await queryInterface.addIndex("comments", ["deleted_at"], {
            name: "idx_comments_deleted_at",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("comments");
    },
};
