const { DataTypes } = require('sequelize');
const { generateUniqueSlug } = require('../../utils/slugGenerator');

module.exports = (sequelize) => {
    const Post = sequelize.define('Post', {
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
        title: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        slug: {
            type: DataTypes.STRING(255),
            unique: true,
            allowNull: true
        },
        thumbnail: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        meta_title: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        meta_description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING(50),
            defaultValue: 'draft'
        },
        visibility: {
            type: DataTypes.STRING(50),
            defaultValue: 'public'
        },
        views_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        likes_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        published_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'posts',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeCreate: async (post) => {
                // Generate slug from title
                if (post.title && !post.slug) {
                    post.slug = await generateUniqueSlug(post.title, Post);
                }
            },
            beforeUpdate: async (post) => {
                // Update slug if title changed
                if (post.changed('title') && post.title) {
                    post.slug = await generateUniqueSlug(post.title, Post, 'slug', post.id);
                }
            }
        }
    });

    // Define associations
    Post.associate = (models) => {
        // Post belongs to User (n:1)
        Post.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });

        // Post belongs to many Topics (n:n through PostTopic)
        Post.belongsToMany(models.Topic, {
            through: models.PostTopic,
            foreignKey: 'post_id',
            otherKey: 'topic_id',
            as: 'topics'
        });

        // Post belongs to many Tags (n:n through PostTag)
        Post.belongsToMany(models.Tag, {
            through: models.PostTag,
            foreignKey: 'post_id',
            otherKey: 'tag_id',
            as: 'tags'
        });

        // Post has many Comments (1:n)
        Post.hasMany(models.Comment, {
            foreignKey: 'commentable_id',
            as: 'comments',
            scope: {
                commentable_type: 'Post'
            }
        });

        // Post has many Likes (1:n)
        Post.hasMany(models.Like, {
            foreignKey: 'likeable_id',
            as: 'likes',
            scope: {
                likeable_type: 'Post'
            }
        });

        // Post has many Bookmarks (1:n)
        Post.hasMany(models.Bookmark, {
            foreignKey: 'post_id',
            as: 'bookmarks'
        });
    };

    return Post;
};
