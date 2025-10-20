const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const UserLesson = sequelize.define(
        "UserLesson",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
            },
            lesson_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "lessons",
                    key: "id",
                },
            },
            completed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            completed_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            watch_duration: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            last_position: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
        },
        {
            tableName: "user_lesson",
            timestamps: true,
            underscored: true,
        }
    );

    // Define associations
    UserLesson.associate = (models) => {
        // UserLesson belongs to User (n:1)
        UserLesson.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });

        // UserLesson belongs to Lesson (n:1)
        UserLesson.belongsTo(models.Lesson, {
            foreignKey: "lesson_id",
            as: "lesson",
        });
    };

    return UserLesson;
};
