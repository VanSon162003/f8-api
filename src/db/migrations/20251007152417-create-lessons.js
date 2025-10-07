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
                type: Sequelize.STRING,
                allowNull: false,
            },
            slug: {
                type: Sequelize.STRING(255),
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
                type: Sequelize.ENUM("youtube", "internal"),
                defaultValue: "youtube",
            },
            video_url: {
                type: Sequelize.STRING(255),
            },
            video_path: {
                type: Sequelize.STRING(255),
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
