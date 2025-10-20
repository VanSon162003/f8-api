"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("quesions", {
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
            lesson_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: "lessons",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            course_id: {
                type: Sequelize.INTEGER,
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
            category: {
                type: Sequelize.ENUM("theory", "bug_report", "off_topic"),
            },
            content: {
                type: Sequelize.TEXT,
            },
            answers_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
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
        await queryInterface.addIndex("quesions", ["user_id"], {
            name: "idx_quesions_user_id",
        });
        await queryInterface.addIndex("quesions", ["lesson_id"], {
            name: "idx_quesions_lesson_id",
        });
        await queryInterface.addIndex("quesions", ["course_id"], {
            name: "idx_quesions_course_id",
        });
        await queryInterface.addIndex("quesions", ["category"], {
            name: "idx_quesions_category",
        });
        await queryInterface.addIndex("quesions", ["created_at"], {
            name: "idx_quesions_created_at",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("quesions");
    },
};
