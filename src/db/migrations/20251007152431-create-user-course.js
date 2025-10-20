"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("user_course", {
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
            completed_at: {
                type: Sequelize.DATE,
            },
            progress_percentage: {
                type: Sequelize.FLOAT,
                defaultValue: 0,
            },
            last_accessed_at: {
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
        await queryInterface.addIndex("user_course", ["user_id"], {
            name: "idx_user_course_user_id",
        });
        await queryInterface.addIndex("user_course", ["course_id"], {
            name: "idx_user_course_course_id",
        });
        await queryInterface.addIndex("user_course", ["user_id", "course_id"], {
            name: "idx_user_course_user_course",
            unique: true,
        });
        await queryInterface.addIndex("user_course", ["last_accessed_at"], {
            name: "idx_user_course_last_accessed",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("user_course");
    },
};
