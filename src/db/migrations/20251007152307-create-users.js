"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("users", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            frist_name: {
                type: Sequelize.STRING(50),
            },
            last_name: {
                type: Sequelize.STRING(50),
            },
            full_name: {
                type: Sequelize.STRING(255),
            },
            email: {
                type: Sequelize.STRING(50),
                unique: true,
                defaultValue: null,
            },
            password: {
                type: Sequelize.STRING(255),
                defaultValue: null,
            },
            two_factor_enabled: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            two_factor_secret: {
                type: Sequelize.STRING,
                defaultValue: null,
            },
            username: {
                type: Sequelize.STRING(50),
                unique: true,
            },
            avatar: {
                type: Sequelize.STRING(255),
                defaultValue: null,
            },
            title: {
                type: Sequelize.STRING(100),
            },
            about: {
                type: Sequelize.TEXT,
            },
            posts_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            follower_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            following_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            address: {
                type: Sequelize.TEXT,
            },
            website_url: {
                type: Sequelize.STRING(255),
            },
            github_url: {
                type: Sequelize.STRING(255),
            },
            facebook_url: {
                type: Sequelize.STRING(255),
            },
            linkedkin_url: {
                type: Sequelize.STRING(255),
            },
            youtube_url: {
                type: Sequelize.STRING(255),
            },
            tiktok_url: {
                type: Sequelize.STRING(255),
            },
            verify_at: {
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
        await queryInterface.addIndex("users", ["email"], {
            name: "idx_users_email",
        });
        await queryInterface.addIndex("users", ["username"], {
            name: "idx_users_username",
        });
        await queryInterface.addIndex("users", ["created_at"], {
            name: "idx_users_created_at",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("users");
    },
};
