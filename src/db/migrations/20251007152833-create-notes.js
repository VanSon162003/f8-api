"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("notes", {
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
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            video_timestamp: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            is_pinned: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
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
        await queryInterface.addIndex("notes", ["user_id"], {
            name: "idx_notes_user_id",
        });
        await queryInterface.addIndex("notes", ["lesson_id"], {
            name: "idx_notes_lesson_id",
        });
        await queryInterface.addIndex("notes", ["user_id", "lesson_id"], {
            name: "idx_notes_user_lesson",
        });
        await queryInterface.addIndex("notes", ["is_pinned"], {
            name: "idx_notes_is_pinned",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("notes");
    },
};
