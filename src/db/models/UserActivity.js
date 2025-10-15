const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const UserActivity = sequelize.define(
        "UserActivity",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
            },
            activity_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            activity_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            activity_type: {
                type: DataTypes.ENUM(
                    "lesson",
                    "post",
                    "comment",
                    "quiz",
                    "login",
                    "all"
                ),
                defaultValue: "all",
            },
        },
        {
            tableName: "user_activities",
            timestamps: true,
            underscored: true,
        }
    );

    // Define associations
    UserActivity.associate = (models) => {
        // UserActivity belongs to User (1:1)
        UserActivity.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });
    };

    return UserActivity;
};
