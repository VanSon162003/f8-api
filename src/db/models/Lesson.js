const { DataTypes } = require('sequelize');
const { generateUniqueSlug } = require('../../utils/slugGenerator');

module.exports = (sequelize) => {
    const Lesson = sequelize.define('Lesson', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        track_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'track',
                key: 'id'
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        duration: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        position: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        video_type: {
            type: DataTypes.ENUM('youtube', 'internal'),
            defaultValue: 'youtube'
        },
        video_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        video_path: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    }, {
        tableName: 'lessons',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeCreate: async (lesson) => {
                // Generate slug from title
                if (lesson.title && !lesson.slug) {
                    lesson.slug = await generateUniqueSlug(lesson.title, Lesson);
                }
            },
            beforeUpdate: async (lesson) => {
                // Update slug if title changed
                if (lesson.changed('title') && lesson.title) {
                    lesson.slug = await generateUniqueSlug(lesson.title, Lesson, 'slug', lesson.id);
                }
            }
        }
    });

    // Define associations
    Lesson.associate = (models) => {
        // Lesson belongs to Track (n:1)
        Lesson.belongsTo(models.Track, {
            foreignKey: 'track_id',
            as: 'track'
        });

        // Lesson belongs to many Users (n:n through UserLesson)
        Lesson.belongsToMany(models.User, {
            through: models.UserLesson,
            foreignKey: "lesson_id",
            otherKey: "user_id",
            as: "users",
        });

        // Lesson has many Notes (1:n)
        Lesson.hasMany(models.Note, {
            foreignKey: 'lesson_id',
            as: 'notes'
        });

        // Lesson has many Questions (1:n)
        Lesson.hasMany(models.Question, {
            foreignKey: 'lesson_id',
            as: 'questions'
        });
    };

    return Lesson;
};
