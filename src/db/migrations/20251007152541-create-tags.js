"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("tags", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING(50),
                unique: true,
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
        await queryInterface.addIndex("tags", ["name"], {
            name: "idx_tags_name",
            unique: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("tags");
    },
};
