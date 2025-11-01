const { DataTypes } = require("sequelize");
const { generateUniqueSlug } = require("../../utils/slugGenerator");

module.exports = (sequelize) => {
    const Lesson = sequelize.define(
        "Lesson",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            track_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "tracks", // ✅ phải trùng với tên bảng trong migration
                    key: "id",
                },
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            thumbnail: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            // 🧩 Nội dung chứa HTML
            content: {
                type: DataTypes.TEXT("long"),
                allowNull: true,
                comment: "Nội dung bài học (có thể chứa thẻ HTML)",
            },
            slug: {
                type: DataTypes.STRING(255),
                allowNull: true,
                unique: true,
            },
            duration: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            position: {
                type: DataTypes.INTEGER,
                defaultValue: 1,
            },
            lesson_type: {
                type: DataTypes.ENUM(
                    "Video",
                    "Lesson",
                    "Challenge",
                    "Question"
                ),
                allowNull: false,
                defaultValue: "Lesson",
            },
            video_type: {
                type: DataTypes.ENUM("Youtube", "Upload"),
                defaultValue: "youtube",
            },
            video_url: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            video_path: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
        },
        {
            tableName: "lessons",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            hooks: {
                beforeCreate: async (lesson) => {
                    // 🔧 Tự tạo slug từ title nếu chưa có
                    if (lesson.title && !lesson.slug) {
                        lesson.slug = await generateUniqueSlug(
                            lesson.title,
                            Lesson
                        );
                    }
                },
                beforeUpdate: async (lesson) => {
                    // 🔧 Cập nhật slug nếu title thay đổi
                    if (lesson.changed("title") && lesson.title) {
                        lesson.slug = await generateUniqueSlug(
                            lesson.title,
                            Lesson,
                            "slug",
                            lesson.id
                        );
                    }
                },
            },
        }
    );

    // 🔗 Associations
    Lesson.associate = (models) => {
        // n:1 — Lesson thuộc về Track
        Lesson.belongsTo(models.Track, {
            foreignKey: "track_id",
            as: "track",
        });

        // n:n — Lesson <-> User qua UserLesson
        Lesson.belongsToMany(models.User, {
            through: models.UserLesson,
            foreignKey: "lesson_id",
            otherKey: "user_id",
            as: "users",
        });

        // 1:n — Lesson có nhiều Note
        Lesson.hasMany(models.Note, {
            foreignKey: "lesson_id",
            as: "notes",
        });

        // 1:n — Lesson có nhiều Question
        Lesson.hasMany(models.Question, {
            foreignKey: "lesson_id",
            as: "questions",
        });

        // 1:n — Lesson là current_lesson trong UserCourseProgress
        Lesson.hasMany(models.UserCourseProgress, {
            foreignKey: "current_lesson_id",
            as: "currentInProgress",
        });

        // 1:n — Lesson có nhiều UserLesson
        Lesson.hasMany(models.UserLesson, {
            foreignKey: "lesson_id",
            as: "userLessons",
        });
    };

    return Lesson;
};
