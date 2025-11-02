const { DataTypes } = require("sequelize");
const { generateUniqueSlug } = require("../../utils/slugGenerator");

module.exports = (sequelize) => {
    const Topic = sequelize.define(
        "Topic",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING(150),
                allowNull: true,
            },
            slug: {
                type: DataTypes.STRING(255),
                unique: true,
                allowNull: true,
            },
            image: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            posts_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
        },
        {
            tableName: "topics",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            hooks: {
                beforeCreate: async (topic) => {
                    // Generate slug from name
                    if (topic.name && !topic.slug) {
                        topic.slug = await generateUniqueSlug(
                            topic.name,
                            Topic
                        );
                    }
                },
                beforeUpdate: async (topic) => {
                    // Update slug if name changed
                    if (topic.changed("name") && topic.name) {
                        topic.slug = await generateUniqueSlug(
                            topic.name,
                            Topic,
                            "slug",
                            topic.id
                        );
                    }
                },
            },
        }
    );

    // Define associations
    Topic.associate = (models) => {
        // Topic belongs to many Posts (n:n through PostTopic)
        Topic.belongsToMany(models.Post, {
            through: models.PostTopic,
            foreignKey: "topic_id",
            otherKey: "post_id",
            as: "posts",
        });
    };

    return Topic;
};
