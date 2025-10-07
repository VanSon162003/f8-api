"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("topics", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING(150),
            },
            slug: {
                type: Sequelize.STRING(255),
                unique: true,
            },
            image: {
                type: Sequelize.STRING(255),
                defaultValue: null,
            },
            description: {
                type: Sequelize.TEXT,
                defaultValue: null,
            },
            posts_count: {
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
        await queryInterface.addIndex("topics", ["slug"], {
            name: "idx_topics_slug",
            unique: true,
        });
        await queryInterface.addIndex("topics", ["posts_count"], {
            name: "idx_topics_posts_count",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("topics");
    },
};
