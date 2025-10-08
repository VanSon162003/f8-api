const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Bookmark = sequelize.define('Bookmark', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
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
        tableName: 'bookmarks',
        timestamps: true
    });

    // Define associations
    Bookmark.associate = (models) => {
        // Bookmark belongs to User (n:1)
        Bookmark.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });

        // Bookmark belongs to Post (n:1)
        Bookmark.belongsTo(models.Post, {
            foreignKey: 'post_id',
            as: 'post'
        });
    };

    return Bookmark;
};
