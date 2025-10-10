const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const UserCourse = sequelize.define(
        "UserCourse",
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
            course_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "courses",
                    key: "id",
                },
            },
            completed_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            progress_percentage: {
                type: DataTypes.FLOAT,
                defaultValue: 0,
            },
            last_accessed_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            tableName: "user_course",
            timestamps: false,
        }
    );

    // Define associations
    UserCourse.associate = (models) => {
        // UserCourse belongs to User (n:1)
        UserCourse.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });

        // UserCourse belongs to Course (n:1)
        UserCourse.belongsTo(models.Course, {
            foreignKey: "course_id",
            as: "course",
        });
    };

    return UserCourse;
};
