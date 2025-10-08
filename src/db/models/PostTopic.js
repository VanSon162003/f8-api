const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PostTopic = sequelize.define('PostTopic', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        topic_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'topics',
                key: 'id'
            }
        },
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'posts',
                key: 'id'
            }
        }
    }, {
        tableName: 'post_topic',
        timestamps: true
    });

    return PostTopic;
};
