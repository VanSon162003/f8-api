module.exports = (sequelize, DataTypes) => {
    const queue = sequelize.define(
        "Queue",
        {
            type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING,
                defaultValue: "pending",
            },
            payload: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            max_retries: {
                type: DataTypes.INTEGER,
                defaultValue: 5,
            },
            retries_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            retried_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "queue",
            underscored: true,
            timestamps: true,
        }
    );

    return queue;
};
