const { DataTypes } = require("sequelize");
const { generateUniqueSlug } = require("../../utils/slugGenerator");

module.exports = (sequelize) => {
    const Post = sequelize.define(
        "Post",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "users",
                    key: "id",
                },
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(255),
                unique: true,
                allowNull: true,
            },
            thumbnail: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            meta_title: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            meta_description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            status: {
                type: DataTypes.STRING(50),
                defaultValue: "draft",
            },
            visibility: {
                type: DataTypes.STRING(50),
                defaultValue: "public",
            },
            views_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            likes_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            reading_time: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            published_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            tableName: "posts",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            hooks: {
                // ✅ Gộp lại thành beforeSave (chạy cả khi tạo & cập nhật)
                beforeSave: async (post) => {
                    // Tạo slug nếu chưa có hoặc title thay đổi
                    if (post.title && (!post.slug || post.changed("title"))) {
                        post.slug = await generateUniqueSlug(
                            post.title,
                            Post,
                            "slug",
                            post.id
                        );
                    }

                    // Tự động tính toán thời gian đọc
                    if (post.content) {
                        const words = post.content.trim().split(/\s+/).length;
                        post.reading_time = Math.ceil(words / 200); // 200 từ/phút
                    } else {
                        post.reading_time = 0;
                    }
                },
            },
        }
    );

    // Associations
    Post.associate = (models) => {
        // (n:1) User tạo post
        Post.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });

        // (n:n) Post - Topic
        Post.belongsToMany(models.Topic, {
            through: models.PostTopic,
            foreignKey: "post_id",
            otherKey: "topic_id",
            as: "topics",
        });

        // (n:n) Post - Tag
        Post.belongsToMany(models.Tag, {
            through: models.PostTag,
            foreignKey: "post_id",
            otherKey: "tag_id",
            as: "tags",
        });

        // (1:n) Post - Comment
        Post.hasMany(models.Comment, {
            foreignKey: "commentable_id",
            as: "comments",
            scope: { commentable_type: "Post" },
        });

        // (1:n) Post - Like
        Post.hasMany(models.Like, {
            foreignKey: "likeable_id",
            as: "likes",
            scope: { likeable_type: "Post" },
        });

        // (1:n) Post - Bookmark
        Post.hasMany(models.Bookmark, {
            foreignKey: "post_id",
            as: "bookmarks",
        });
    };

    return Post;
};
