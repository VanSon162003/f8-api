const { DataTypes } = require("sequelize");
const { generateUniqueSlug } = require("../../utils/slugGenerator");

module.exports = (sequelize) => {
    const Course = sequelize.define(
        "Course",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            creator_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            thumbnail: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            slug: {
                type: DataTypes.STRING(255),
                unique: true,
                allowNull: true,
            },
            // ✅ Lưu dạng JSON thay vì TEXT
            what_you_learn: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: "Mảng nội dung học được",
            },
            requirement: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: "Mảng yêu cầu đầu vào",
            },
            level: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("published", "draft"),
                allowNull: false,
                defaultValue: "draft",
            },
            total_comment: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            total_track: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            total_view: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            total_lesson: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            total_duration: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            is_pro: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            old_price: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
        },
        {
            tableName: "courses",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            hooks: {
                beforeCreate: async (course) => {
                    if (course.title && !course.slug) {
                        course.slug = await generateUniqueSlug(
                            course.title,
                            Course
                        );
                    }
                },
                beforeUpdate: async (course) => {
                    if (course.changed("title") && course.title) {
                        course.slug = await generateUniqueSlug(
                            course.title,
                            Course,
                            "slug",
                            course.id
                        );
                    }
                },
            },
        }
    );

    // 🔗 Associations
    Course.associate = (models) => {
        // 1 Course -> n Tracks
        Course.hasMany(models.Track, {
            foreignKey: "course_id",
            as: "tracks",
        });

        // 1 Course -> 1 Creator (User)
        Course.belongsTo(models.User, {
            foreignKey: "creator_id",
            as: "creator",
        });

        // n:n Course <-> User (UserCourse)
        Course.belongsToMany(models.User, {
            through: models.UserCourse,
            foreignKey: "course_id",
            otherKey: "user_id",
            as: "users",
        });

        // 1 Course -> n Questions
        Course.hasMany(models.Question, {
            foreignKey: "course_id",
            as: "questions",
        });

        // n:n Course <-> LearningPath (LearningPathCourse)
        Course.belongsToMany(models.LearningPath, {
            through: models.LearningPathCourse,
            foreignKey: "course_id",
            otherKey: "learning_path_id",
            as: "learningPaths",
        });

        // 1 Course -> nhiều UserCourseProgress
        Course.hasMany(models.UserCourseProgress, {
            foreignKey: "course_id",
            as: "userProgress",
        });

        // 1 Course -> n Payments
        Course.hasMany(models.Payment, {
            foreignKey: "course_id",
            as: "payments",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
    };

    return Course;
};
