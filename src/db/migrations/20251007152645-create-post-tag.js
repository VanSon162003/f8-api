"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("post_tag", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            post_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: "posts",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            tag_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: "tags",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
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
        await queryInterface.addIndex("post_tag", ["post_id"], {
            name: "idx_post_tag_post_id",
        });
        await queryInterface.addIndex("post_tag", ["tag_id"], {
            name: "idx_post_tag_tag_id",
        });
        await queryInterface.addIndex("post_tag", ["post_id", "tag_id"], {
            name: "idx_post_tag_post_tag",
            unique: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("post_tag");
    },
};
