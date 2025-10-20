"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("learning_path_course", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            learning_path_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: "learning_path",
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
        await queryInterface.addIndex(
            "learning_path_course",
            ["learning_path_id"],
            {
                name: "idx_learning_path_course_path_id",
            }
        );
        await queryInterface.addIndex("learning_path_course", ["course_id"], {
            name: "idx_learning_path_course_course_id",
        });
        await queryInterface.addIndex(
            "learning_path_course",
            ["learning_path_id", "course_id"],
            {
                name: "idx_learning_path_course_path_course",
                unique: true,
            }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("learning_path_course");
    },
};
