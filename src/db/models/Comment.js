const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Comment = sequelize.define('Comment', {
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
        parent_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'comments',
                key: 'id'
            }
        },
        commentable_type: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        commentable_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        like_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'comments',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    });

    // Define associations
    Comment.associate = (models) => {
        // Comment belongs to User (n:1)
        Comment.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });

        // Comment belongs to Comment (self-referential for replies)
        Comment.belongsTo(models.Comment, {
            foreignKey: 'parent_id',
            as: 'parent'
        });

        // Comment has many Comments (self-referential for replies)
        Comment.hasMany(models.Comment, {
            foreignKey: 'parent_id',
            as: 'replies'
        });
    };

    return Comment;
};
