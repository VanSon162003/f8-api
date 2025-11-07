"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Slide extends Model {
        static associate(models) {
            // define association here
        }
    }

    Slide.init(
        {
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: DataTypes.TEXT,
            buttonText: DataTypes.STRING,
            image: DataTypes.STRING,
            className: {
                type: DataTypes.STRING,
                defaultValue: "slide-default",
            },
            customStyles: {
                type: DataTypes.JSON,
                defaultValue: {
                    backgroundColor: "#8EC5FC",
                    backgroundImage:
                        "linear-gradient(to right, rgb(0, 126, 254), rgb(6, 195, 254))",
                    color: "black",
                },
            },
            order: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            url: {
                type: DataTypes.STRING,
                allowNull: true,

                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: "Slide",
            tableName: "slides",
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return Slide;
};
