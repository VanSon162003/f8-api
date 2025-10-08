const { DataTypes } = require('sequelize');
const { generateUniqueSlug } = require('../../utils/slugGenerator');

module.exports = (sequelize) => {
    const LearningPath = sequelize.define('LearningPath', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        slug: {
            type: DataTypes.STRING(255),
            unique: true,
            allowNull: true
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        thumbnail: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    }, {
        tableName: 'learning_path',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeCreate: async (learningPath) => {
                // Generate slug from title
                if (learningPath.title && !learningPath.slug) {
                    learningPath.slug = await generateUniqueSlug(learningPath.title, LearningPath);
                }
            },
            beforeUpdate: async (learningPath) => {
                // Update slug if title changed
                if (learningPath.changed('title') && learningPath.title) {
                    learningPath.slug = await generateUniqueSlug(learningPath.title, LearningPath, 'slug', learningPath.id);
                }
            }
        }
    });

    // Define associations
    LearningPath.associate = (models) => {
        // LearningPath belongs to many Courses (n:n through LearningPathCourse)
        LearningPath.belongsToMany(models.Course, {
            through: models.LearningPathCourse,
            foreignKey: 'learning_path_id',
            otherKey: 'course_id',
            as: 'courses'
        });
    };

    return LearningPath;
};
