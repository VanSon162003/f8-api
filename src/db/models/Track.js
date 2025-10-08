const { DataTypes } = require('sequelize');
const { generateUniqueSlug } = require('../../utils/slugGenerator');

module.exports = (sequelize) => {
    const Track = sequelize.define('Track', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        course_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'courses',
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
        total_lesson: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_duration: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        position: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        }
    }, {
        tableName: 'track',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeCreate: async (track) => {
                // Generate slug from title
                if (track.title && !track.slug) {
                    track.slug = await generateUniqueSlug(track.title, Track);
                }
            },
            beforeUpdate: async (track) => {
                // Update slug if title changed
                if (track.changed('title') && track.title) {
                    track.slug = await generateUniqueSlug(track.title, Track, 'slug', track.id);
                }
            }
        }
    });

    // Define associations
    Track.associate = (models) => {
        // Track belongs to Course (n:1)
        Track.belongsTo(models.Course, {
            foreignKey: 'course_id',
            as: 'course'
        });

        // Track has many Lessons (1:n)
        Track.hasMany(models.Lesson, {
            foreignKey: 'track_id',
            as: 'lessons'
        });
    };

    return Track;
};
