// models/ReactionType.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const ReactionType = sequelize.define(
        "ReactionType",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            label: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            icon: {
                type: DataTypes.STRING(10),
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                field: "created_at",
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                field: "updated_at",
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "reaction_types",
            timestamps: true,
            underscored: true,
        }
    );

    ReactionType.associate = (models) => {
        ReactionType.hasMany(models.CommentReaction, {
            foreignKey: "reaction_type_id",
            as: "commentReactions",
        });
    };

    return ReactionType;
};
