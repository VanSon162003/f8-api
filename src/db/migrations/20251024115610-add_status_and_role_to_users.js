"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        // Thêm cột 'role'
        await queryInterface.addColumn("users", "role", {
            type: Sequelize.ENUM("user", "instructor", "admin"),
            allowNull: false,
            defaultValue: "user",
            after: "email", // tuỳ chọn, để xác định vị trí cột
        });

        // Thêm cột 'status'
        await queryInterface.addColumn("users", "status", {
            type: Sequelize.ENUM("active", "locked"),
            allowNull: false,
            defaultValue: "active",
            after: "role",
        });
    },

    async down(queryInterface, Sequelize) {
        // Xóa 2 cột khi rollback
        await queryInterface.removeColumn("users", "role");
        await queryInterface.removeColumn("users", "status");

        // Xóa ENUM type (nếu bạn dùng PostgreSQL, cần thêm bước này)
        // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
        // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_status";');
    },
};
