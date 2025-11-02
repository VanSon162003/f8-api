"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("posts", "is_approved", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            after: "content",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("posts", "is_approved");
    },
};
