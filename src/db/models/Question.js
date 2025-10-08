const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Question = sequelize.define('Question', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        lesson_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'lessons',
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
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category: {
            type: DataTypes.ENUM('theory', 'bug_report', 'off_topic'),
            allowNull: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        answers_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: 'quesions',
        timestamps: true
    });

    // Define associations
    Question.associate = (models) => {
        // Question belongs to User (n:1)
        Question.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });

        // Question belongs to Lesson (n:1)
        Question.belongsTo(models.Lesson, {
            foreignKey: 'lesson_id',
            as: 'lesson'
        });

        // Question belongs to Course (n:1)
        Question.belongsTo(models.Course, {
            foreignKey: 'course_id',
            as: 'course'
        });
    };

    return Question;
};
