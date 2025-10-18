"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("payments", "stripe_session_id", {
            type: Sequelize.STRING,
            allowNull: true,
            after: "payment_id",
            comment: "Stripe Checkout Session ID để mapping với webhook events",
        });

        // Add index to speed up lookups by session_id
        await queryInterface.addIndex("payments", ["stripe_session_id"], {
            name: "payments_stripe_session_id_idx",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex(
            "payments",
            "payments_stripe_session_id_idx"
        );
        await queryInterface.removeColumn("payments", "stripe_session_id");
    },
};
