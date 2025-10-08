const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserSetting = sequelize.define('UserSetting', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        data: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'user_setting',
        timestamps: true
    });

    // Define associations
    UserSetting.associate = (models) => {
        // UserSetting belongs to User (1:1)
        UserSetting.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
    };

    return UserSetting;
};
