const { DataTypes } = require('sequelize');
const { generateUniqueSlug } = require('../../utils/slugGenerator');

module.exports = (sequelize) => {
    const Course = sequelize.define('Course', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        thumbnail: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        slug: {
            type: DataTypes.STRING(255),
            unique: true,
            allowNull: true
        },
        what_you_learn: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        requirement: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        level: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        total_track: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_lesson: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_duration: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        is_pro: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        }
    }, {
        tableName: 'courses',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeCreate: async (course) => {
                // Generate slug from title
                if (course.title && !course.slug) {
                    course.slug = await generateUniqueSlug(course.title, Course);
                }
            },
            beforeUpdate: async (course) => {
                // Update slug if title changed
                if (course.changed('title') && course.title) {
                    course.slug = await generateUniqueSlug(course.title, Course, 'slug', course.id);
                }
            }
        }
    });

    // Define associations
    Course.associate = (models) => {
        // Course has many Tracks (1:n)
        Course.hasMany(models.Track, {
            foreignKey: 'course_id',
            as: 'tracks'
        });

        // Course has many UserCourses (1:n)
        Course.hasMany(models.UserCourse, {
            foreignKey: 'course_id',
            as: 'userCourses'
        });

        // Course has many Questions (1:n)
        Course.hasMany(models.Question, {
            foreignKey: 'course_id',
            as: 'questions'
        });

        // Course belongs to many LearningPaths (n:n through LearningPathCourse)
        Course.belongsToMany(models.LearningPath, {
            through: models.LearningPathCourse,
            foreignKey: 'course_id',
            otherKey: 'learning_path_id',
            as: 'learningPaths'
        });
    };

    return Course;
};
