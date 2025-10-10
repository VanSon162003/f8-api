const { DataTypes } = require("sequelize");
const { generateUniqueUsername } = require("../../utils/slugGenerator");

module.exports = (sequelize) => {
    const User = sequelize.define(
        "User",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            auth0_id: {
                type: DataTypes.STRING(255),
                unique: true,
                allowNull: true,
            },
            frist_name: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            last_name: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            full_name: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING(50),
                unique: true,
                allowNull: true,
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            two_factor_enabled: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            two_factor_secret: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            username: {
                type: DataTypes.STRING(50),
                unique: true,
                allowNull: true,
            },
            avatar: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            title: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            about: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            posts_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            follower_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            following_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            website_url: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            github_url: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            facebook_url: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            linkedkin_url: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            youtube_url: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            tiktok_url: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            verify_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            tableName: "users",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            hooks: {
                beforeCreate: async (user) => {
                    // Generate full_name
                    if (user.frist_name || user.last_name) {
                        user.full_name = `${user.frist_name || ""} ${
                            user.last_name || ""
                        }`.trim();
                    }

                    // Generate username
                    if (!user.username) {
                        user.username = await generateUniqueUsername(
                            user.email,
                            User,
                            null,
                            user.frist_name,
                            user.last_name
                        );
                    }
                },
                beforeUpdate: async (user) => {
                    // Update full_name if first_name or last_name changed
                    if (
                        user.changed("frist_name") ||
                        user.changed("last_name")
                    ) {
                        user.full_name = `${user.frist_name || ""} ${
                            user.last_name || ""
                        }`.trim();
                    }

                    // Update username if email, first_name or last_name changed
                    if (
                        user.changed("email") ||
                        user.changed("frist_name") ||
                        user.changed("last_name")
                    ) {
                        user.username = await generateUniqueUsername(
                            user.email,
                            User,
                            user.id,
                            user.frist_name,
                            user.last_name
                        );
                    }
                },
            },
        }
    );

    // Define associations
    User.associate = (models) => {
        // User has one UserSetting (1:1)
        User.hasOne(models.UserSetting, {
            foreignKey: "user_id",
            as: "setting",
        });

        // User has many Posts (1:n)
        User.hasMany(models.Post, {
            foreignKey: "user_id",
            as: "posts",
        });

        // User has many Comments (1:n)
        User.hasMany(models.Comment, {
            foreignKey: "user_id",
            as: "comments",
        });

        // User has many Notes (1:n)
        User.hasMany(models.Note, {
            foreignKey: "user_id",
            as: "notes",
        });

        // User has many Questions (1:n)
        User.hasMany(models.Question, {
            foreignKey: "user_id",
            as: "questions",
        });

        // User has many Likes (1:n)
        User.hasMany(models.Like, {
            foreignKey: "user_id",
            as: "likes",
        });

        // User has many Bookmarks (1:n)
        User.hasMany(models.Bookmark, {
            foreignKey: "user_id",
            as: "bookmarks",
        });

        // User has many Notifications (1:n)
        User.hasMany(models.Notification, {
            foreignKey: "notifiable_id",
            as: "notifications",
            scope: {
                notifiable_type: "User",
            },
        });

        // User follows many Users (n:n through Follows)
        User.belongsToMany(models.User, {
            through: models.Follow,
            foreignKey: "following_id",
            otherKey: "followed_id",
            as: "following",
        });

        // User is followed by many Users (n:n through Follows)
        User.belongsToMany(models.User, {
            through: models.Follow,
            foreignKey: "followed_id",
            otherKey: "following_id",
            as: "followers",
        });

        // User has many UserCourses (1:n)
        User.hasMany(models.UserCourse, {
            foreignKey: "user_id",
            as: "userCourses",
        });

        // User has many UserLessons (1:n)
        User.hasMany(models.UserLesson, {
            foreignKey: "user_id",
            as: "userLessons",
        });

        // User has many UserActivities (1:n)
        User.hasMany(models.UserActivity, {
            foreignKey: "user_id",
            as: "activities",
        });
    };

    return User;
};
