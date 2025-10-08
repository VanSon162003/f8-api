const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Video = sequelize.define('Video', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        youtube_id: {
            type: DataTypes.STRING(50),
            unique: true,
            allowNull: false
        },
        video_id: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        thumbnail_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        duration: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        views_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        likes_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        comments_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        is_featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        published_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'videos',
        timestamps: true
    });

    // Define associations
    Video.associate = (models) => {
        // Video has many Comments (1:n)
        Video.hasMany(models.Comment, {
            foreignKey: 'commentable_id',
            as: 'comments',
            scope: {
                commentable_type: 'Video'
            }
        });

        // Video has many Likes (1:n)
        Video.hasMany(models.Like, {
            foreignKey: 'likeable_id',
            as: 'likes',
            scope: {
                likeable_type: 'Video'
            }
        });
    };

    return Video;
};
