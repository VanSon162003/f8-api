"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("posts", {
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
            title: {
                type: Sequelize.STRING(255),
            },
            slug: {
                type: Sequelize.STRING(255),
                unique: true,
            },
            thumbnail: {
                type: Sequelize.STRING(255),
                defaultValue: null,
            },
            description: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            meta_title: {
                type: Sequelize.STRING(255),
                defaultValue: null,
            },
            meta_description: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            content: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            status: {
                type: Sequelize.ENUM("draft", "published", "scheduled"),
                allowNull: false,
                defaultValue: "draft",
            },

            visibility: {
                type: Sequelize.STRING(50),
                defaultValue: "public",
            },
            views_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            likes_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            reading_time: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            published_at: {
                type: Sequelize.DATE,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });

        // Indexes
        await queryInterface.addIndex("posts", ["user_id"], {
            name: "idx_posts_user_id",
        });
        await queryInterface.addIndex("posts", ["slug"], {
            name: "idx_posts_slug",
            unique: true,
        });
        await queryInterface.addIndex("posts", ["status"], {
            name: "idx_posts_status",
        });
        await queryInterface.addIndex("posts", ["visibility"], {
            name: "idx_posts_visibility",
        });
        await queryInterface.addIndex("posts", ["published_at"], {
            name: "idx_posts_published_at",
        });
        await queryInterface.addIndex("posts", ["views_count"], {
            name: "idx_posts_views_count",
        });
        await queryInterface.addIndex("posts", ["likes_count"], {
            name: "idx_posts_likes_count",
        });
        await queryInterface.addIndex("posts", ["status", "published_at"], {
            name: "idx_posts_status_published",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("posts");
    },
};
