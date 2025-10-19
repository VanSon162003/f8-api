// models/userNotification.js
module.exports = (sequelize, DataTypes) => {
    const UserNotification = sequelize.define(
        "UserNotification",
        {
            user_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            notification_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            read_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            tableName: "user_notification",
            timestamps: false,
        }
    );

    return UserNotification;
};
