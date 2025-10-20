"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("posts", "total_comment", {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            after: "content",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("posts", "total_comment");
    },
};
