"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert("Settings", [
            {
                name: "F8 Clone",
                description: "Học Lập Trình Để Đi Làm",
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete("Settings", null, {});
    },
};
