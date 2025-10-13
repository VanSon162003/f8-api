"use strict";

module.exports = (sequelize, DataTypes) => {
    const UserCourseProgress = sequelize.define(
        "UserCourseProgress",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            course_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            current_lesson_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            learned_lessons: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: [],
                comment: "Danh sách ID các bài học đã học qua",
            },
            progress: {
                type: DataTypes.FLOAT,
                allowNull: false,
                defaultValue: 0,
                comment: "Tiến độ học (%)",
            },
            is_completed: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            last_viewed_at: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "user_course_progress",
            underscored: true,
        }
    );

    UserCourseProgress.associate = (models) => {
        UserCourseProgress.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });

        UserCourseProgress.belongsTo(models.Course, {
            foreignKey: "course_id",
            as: "course",
        });

        UserCourseProgress.belongsTo(models.Lesson, {
            foreignKey: "current_lesson_id",
            as: "currentLesson",
        });
    };

    return UserCourseProgress;
};
