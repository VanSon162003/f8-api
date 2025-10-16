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
            title: {
                type: DataTypes.STRING(255),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [1, 255],
                },
            },
            slug: {
                type: DataTypes.STRING(255),
                unique: true,
                allowNull: true,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            thumbnail: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("draft", "published", "scheduled"),
                defaultValue: "draft",
                allowNull: false,
            },
            visibility: {
                type: DataTypes.STRING(50),
                defaultValue: "public",
            },
            views_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "users",
                    key: "id",
                },
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
                beforeCreate: async (post) => {
                    if (post.title && !post.slug) {
                        post.slug = await generateUniqueSlug(post.title, Post);
                    }
                    if (post.status === "published" && !post.published_at) {
                        post.published_at = new Date();
                    }
                },
                beforeUpdate: async (post) => {
                    if (post.changed("title") && post.title) {
                        post.slug = await generateUniqueSlug(
                            post.title,
                            Post,
                            "slug",
                            post.id
                        );
                    }
                    if (
                        post.changed("status") &&
                        post.status === "published" &&
                        !post.published_at
                    ) {
                        post.published_at = new Date();
                    }
                },
            },
        }
    );

    Post.associate = (models) => {
        // Post belongs to User (Author)
        Post.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "author",
        });

        // Post belongs to many Tags through PostTag
        Post.belongsToMany(models.Tag, {
            through: models.PostTag,
            foreignKey: "post_id",
            otherKey: "tag_id",
            as: "tags",
        });
    };

    return Post;
};
