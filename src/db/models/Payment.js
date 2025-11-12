"use strict";

module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define(
        "Payment",
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
            course_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            payment_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            amount: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM(
                    "pending",
                    "succeeded",
                    "failed",
                    "cancelled",
                    "completed"
                ),
                defaultValue: "pending",
            },
            currency: {
                type: DataTypes.STRING(50),
                defaultValue: "vnd",
            },
            payed_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            stripe_session_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            reference_code: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
            },
            qr_code: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            order_code: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            sepay_transaction_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            payment_method: {
                type: DataTypes.ENUM("stripe", "sepay"),
                defaultValue: "stripe",
            },
            expires_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            transaction_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            tableName: "payments",
            timestamps: true,
            underscored: true,
        }
    );

    Payment.associate = (models) => {
        Payment.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });

        Payment.belongsTo(models.Course, {
            foreignKey: "course_id",
            as: "course",
        });
    };

    return Payment;
};
