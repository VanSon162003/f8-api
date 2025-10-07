"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("post_topic", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            topic_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: "topics",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
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
        await queryInterface.addIndex("post_topic", ["topic_id"], {
            name: "idx_post_topic_topic_id",
        });
        await queryInterface.addIndex("post_topic", ["post_id"], {
            name: "idx_post_topic_post_id",
        });
        await queryInterface.addIndex("post_topic", ["topic_id", "post_id"], {
            name: "idx_post_topic_topic_post",
            unique: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("post_topic");
    },
};
