const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Notification = sequelize.define(
        "Notification",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            type: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            to: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            notifiable_type: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            notifiable_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            tableName: "notifications",
            timestamps: true,
            underscored: true,
        }
    );

    Notification.associate = (db) => {
        Notification.belongsToMany(db.User, {
            through: db.UserNotification,
            foreignKey: "notification_id",
            otherKey: "user_id",
            as: "users",
        });
    };

    return Notification;
};
