const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const AccessToken = sequelize.define(
        "AccessToken",
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            access_token: {
                type: DataTypes.STRING(512),
                allowNull: false,
            },
            deleted_at: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
            },
            created_at: {
                allowNull: false,
                type: DataTypes.DATE,
                defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
                allowNull: false,
                type: DataTypes.DATE,
                defaultValue: sequelize.literal(
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                ),
            },
        },
        {
            tableName: "access_token",
            timestamps: true,
            underscored: true,
        }
    );

    return AccessToken;
};
