"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("slides", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
            },
            buttonText: {
                type: Sequelize.STRING,
            },
            image: {
                type: Sequelize.STRING,
            },
            className: {
                type: Sequelize.STRING,
                defaultValue: "slide-default",
            },
            customStyles: {
                type: Sequelize.JSON,
                defaultValue: {
                    backgroundColor: "#8EC5FC",
                    backgroundImage:
                        "linear-gradient(to right, rgb(0, 126, 254), rgb(6, 195, 254))",
                    color: "black",
                },
            },
            order: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("slides");
    },
};
