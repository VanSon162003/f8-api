"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("user_lesson", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
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
            lesson_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "lessons",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            completed: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            completed_at: {
                type: Sequelize.DATE,
                defaultValue: null,
            },
            watch_duration: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            last_position: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
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
        await queryInterface.addIndex("user_lesson", ["user_id"], {
            name: "idx_user_lesson_user_id",
        });
        await queryInterface.addIndex("user_lesson", ["lesson_id"], {
            name: "idx_user_lesson_lesson_id",
        });
        await queryInterface.addIndex("user_lesson", ["user_id", "lesson_id"], {
            name: "idx_user_lesson_user_lesson",
            unique: true,
        });
        await queryInterface.addIndex("user_lesson", ["completed"], {
            name: "idx_user_lesson_completed",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("user_lesson");
    },
};
