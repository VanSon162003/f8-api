"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("track", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            course_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "courses",
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
            total_lesson: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            total_duration: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            position: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
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
        await queryInterface.addIndex("track", ["course_id"], {
            name: "idx_track_course_id",
        });
        await queryInterface.addIndex("track", ["slug"], {
            name: "idx_track_slug",
        });
        await queryInterface.addIndex("track", ["course_id", "position"], {
            name: "idx_track_course_position",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("track");
    },
};
