"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("payments", "stripe_session_id", {
            type: Sequelize.STRING,
            allowNull: true,
            after: "payment_id",
        });
        // Add index for faster lookups
        await queryInterface.addIndex("payments", ["stripe_session_id"]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex("payments", ["stripe_session_id"]);
        await queryInterface.removeColumn("payments", "stripe_session_id");
    },
};
