"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("user_activities", {
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
            activity_date: {
                type: Sequelize.DATE,
            },
            activity_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            activity_type: {
                type: Sequelize.ENUM(
                    "lesson",
                    "post",
                    "comment",
                    "quiz",
                    "login",
                    "all"
                ),
                defaultValue: "all",
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
        await queryInterface.addIndex("user_activities", ["user_id"], {
            name: "idx_user_activities_user_id",
        });
        await queryInterface.addIndex("user_activities", ["activity_date"], {
            name: "idx_user_activities_date",
        });
        await queryInterface.addIndex("user_activities", ["activity_type"], {
            name: "idx_user_activities_type",
        });
        await queryInterface.addIndex(
            "user_activities",
            ["user_id", "activity_date"],
            {
                name: "idx_user_activities_user_date",
            }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("user_activities");
    },
};
