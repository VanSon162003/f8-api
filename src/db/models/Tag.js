const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Tag = sequelize.define('Tag', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50),
            unique: true,
            allowNull: true
        }
    }, {
        tableName: 'tags',
        timestamps: true
    });

    // Define associations
    Tag.associate = (models) => {
        // Tag belongs to many Posts (n:n through PostTag)
        Tag.belongsToMany(models.Post, {
            through: models.PostTag,
            foreignKey: 'tag_id',
            otherKey: 'post_id',
            as: 'posts'
        });
    };

    return Tag;
};
