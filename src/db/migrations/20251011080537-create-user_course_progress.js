"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("user_course_progress", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
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
            current_lesson_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "lessons",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            learned_lessons: {
                type: Sequelize.JSON,
                allowNull: false,
                defaultValue: [],
            },
            progress: {
                type: Sequelize.FLOAT,
                allowNull: false,
                defaultValue: 0,
            },
            is_completed: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            last_viewed_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal(
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                ),
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("user_course_progress");
    },
};
