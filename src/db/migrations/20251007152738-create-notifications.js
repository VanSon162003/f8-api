"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("notifications", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            type: {
                type: Sequelize.STRING(50),
            },
            title: {
                type: Sequelize.STRING(255),
            },
            notifiable_type: {
                type: Sequelize.STRING(100),
            },
            notifiable_id: {
                type: Sequelize.INTEGER,
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
        await queryInterface.addIndex("notifications", ["type"], {
            name: "idx_notifications_type",
        });
        await queryInterface.addIndex(
            "notifications",
            ["notifiable_type", "notifiable_id"],
            {
                name: "idx_notifications_notifiable",
            }
        );
        await queryInterface.addIndex("notifications", ["created_at"], {
            name: "idx_notifications_created_at",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("notifications");
    },
};
