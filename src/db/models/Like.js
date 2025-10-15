const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Like = sequelize.define(
        "Like",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "users",
                    key: "id",
                },
            },
            likeable_type: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            likeable_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            tableName: "likes",
            timestamps: true,
            underscored: true,
        }
    );

    // Define associations
    Like.associate = (models) => {
        // Like belongs to User (n:1)
        Like.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });
    };

    return Like;
};
