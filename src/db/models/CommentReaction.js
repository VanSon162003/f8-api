// models/CommentReaction.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const CommentReaction = sequelize.define(
        "CommentReaction",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            comment_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            reaction_type_id: {
                type: DataTypes.INTEGER,
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
            tableName: "comment_reactions",
            timestamps: true,
            underscored: true,
        }
    );

    CommentReaction.associate = (models) => {
        CommentReaction.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });

        CommentReaction.belongsTo(models.Comment, {
            foreignKey: "comment_id",
            as: "comment",
        });

        CommentReaction.belongsTo(models.ReactionType, {
            foreignKey: "reaction_type_id",
            as: "reactionType",
        });
    };

    return CommentReaction;
};
