const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PostTag = sequelize.define('PostTag', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'posts',
                key: 'id'
            }
        },
        tag_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'tags',
                key: 'id'
            }
        }
    }, {
        tableName: 'post_tag',
        timestamps: true
    });

    return PostTag;
};
