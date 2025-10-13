"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("comment_reactions", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            comment_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "comments",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            reaction_type_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "reaction_types",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });

        // Mỗi user chỉ có thể react 1 lần trên 1 comment
        await queryInterface.addConstraint("comment_reactions", {
            fields: ["user_id", "comment_id"],
            type: "unique",
            name: "unique_user_comment_reaction",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("comment_reactions");
    },
};
