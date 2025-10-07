"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("courses", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            title: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            thumbnail: {
                type: Sequelize.STRING(255),
            },
            slug: {
                type: Sequelize.STRING(255),
                unique: true,
            },
            what_you_learn: {
                type: Sequelize.TEXT,
            },
            requirement: {
                type: Sequelize.TEXT,
            },
            level: {
                type: Sequelize.STRING(255),
            },
            total_track: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            total_lesson: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            total_duration: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            is_pro: {
                type: Sequelize.BOOLEAN,
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
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
        await queryInterface.addIndex("courses", ["slug"], {
            name: "idx_courses_slug",
            unique: true,
        });
        await queryInterface.addIndex("courses", ["is_pro"], {
            name: "idx_courses_is_pro",
        });
        await queryInterface.addIndex("courses", ["level"], {
            name: "idx_courses_level",
        });
        await queryInterface.addIndex("courses", ["created_at"], {
            name: "idx_courses_created_at",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("courses");
    },
};
