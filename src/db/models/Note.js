const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Note = sequelize.define('Note', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        lesson_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'lessons',
                key: 'id'
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        video_timestamp: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        is_pinned: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'notes',
        timestamps: true
    });

    // Define associations
    Note.associate = (models) => {
        // Note belongs to User (n:1)
        Note.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });

        // Note belongs to Lesson (n:1)
        Note.belongsTo(models.Lesson, {
            foreignKey: 'lesson_id',
            as: 'lesson'
        });
    };

    return Note;
};
