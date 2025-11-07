"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Settings extends Model {
        static associate(models) {
            // define associations here
        }
    }

    Settings.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            logo: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            favicon: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "Settings",
            tableName: "settings",
            underscored: true,
        }
    );

    return Settings;
};
