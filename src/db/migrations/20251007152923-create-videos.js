"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("videos", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            youtube_id: {
                type: Sequelize.STRING(50),
                unique: true,
                allowNull: false,
            },
            title: {
                type: Sequelize.STRING(255),
            },
            description: {
                type: Sequelize.TEXT,
            },
            thumbnail_url: {
                type: Sequelize.STRING(255),
            },
            duration: {
                type: Sequelize.STRING(20),
            },
            views_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            likes_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            comments_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            is_featured: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            published_at: {
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
        await queryInterface.addIndex("videos", ["youtube_id"], {
            name: "idx_videos_youtube_id",
            unique: true,
        });
        await queryInterface.addIndex("videos", ["is_featured"], {
            name: "idx_videos_is_featured",
        });
        await queryInterface.addIndex("videos", ["published_at"], {
            name: "idx_videos_published_at",
        });
        await queryInterface.addIndex("videos", ["views_count"], {
            name: "idx_videos_views_count",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("videos");
    },
};
