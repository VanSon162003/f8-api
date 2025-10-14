const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const LearningPathCourse = sequelize.define('LearningPathCourse', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        learning_path_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'learning_path',
                key: 'id'
            }
        },
        course_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'courses',
                key: 'id'
            }
        }
    }, {
        tableName: 'learning_path_course',
        timestamps: false
    });

    return LearningPathCourse;
};
