const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const NewFeed = sequelize.define('NewFeed', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'new_feed',
        timestamps: true
    });

    return NewFeed;
};
