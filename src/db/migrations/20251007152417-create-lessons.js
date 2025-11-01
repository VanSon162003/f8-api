"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("lessons", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },

            track_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "track",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            title: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },

            // Nội dung HTML
            content: {
                type: Sequelize.TEXT("long"),
                allowNull: true,
                comment: "Nội dung bài học, có thể chứa thẻ HTML",
            },

            slug: {
                type: Sequelize.STRING(255),
                allowNull: true,
                unique: true,
            },

            duration: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },

            position: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
            },

            video_type: {
                type: Sequelize.ENUM("Youtube", "Upload"),
                defaultValue: "youtube",
            },

            video_url: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },

            video_path: {
                type: Sequelize.STRING(255),
                allowNull: true,
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
        await queryInterface.addIndex("lessons", ["track_id"], {
            name: "idx_lessons_track_id",
        });

        await queryInterface.addIndex("lessons", ["slug"], {
            name: "idx_lessons_slug",
        });

        await queryInterface.addIndex("lessons", ["track_id", "position"], {
            name: "idx_lessons_track_position",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("lessons");
    },
};
