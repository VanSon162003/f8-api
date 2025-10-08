"use strict";

module.exports = (sequelize, DataTypes) => {
    const RefreshToken = sequelize.define(
        "RefreshToken",
        {
            id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            token: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            expired_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            tableName: "refresh_tokens",
            timestamps: true,
            underscored: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    RefreshToken.associate = (models) => {
        RefreshToken.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });
    };

    return RefreshToken;
};
