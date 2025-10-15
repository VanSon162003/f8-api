const { DataTypes } = require('sequelize');
const { generateUniqueSlug } = require('../../utils/slugGenerator');

module.exports = (sequelize) => {
    const Tag = sequelize.define('Tag', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: true,
            unique: true,
            validate: {
                notEmpty: true,
                len: [1, 50]
            }
        }
    }, {
        tableName: 'tags',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    Tag.associate = (models) => {
        // Tag belongs to many Posts through PostTag
        Tag.belongsToMany(models.Post, {
            through: models.PostTag,
            foreignKey: 'tag_id',
            otherKey: 'post_id',
            as: 'posts'
        });
    };

    return Tag;
};