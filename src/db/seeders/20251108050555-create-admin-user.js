"use strict";

const bcrypt = require("bcrypt");

module.exports = {
    async up(queryInterface, Sequelize) {
        // Thay đổi thông tin admin ở đây nếu cần
        const passwordPlain = "123456789"; // đổi mật khẩu mặc định
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(passwordPlain, saltRounds);

        const now = new Date();

        await queryInterface.bulkInsert(
            "users",
            [
                {
                    id: 1, // nếu id tự tăng thì có thể bỏ dòng này
                    frist_name: "Admin",
                    last_name: "System",
                    full_name: "Admin System",
                    username: "admin",
                    email: "admin@gmail.com",
                    password: passwordHash,
                    two_factor_enabled: false,
                    two_factor_secret: null,
                    role: "admin", // nếu bảng có cột role (enum/string)
                    status: "active",
                    created_at: now,
                    updated_at: now,
                    verify_at: now,
                },
            ],
            {}
        );
    },

    async down(queryInterface, Sequelize) {
        // Xóa user admin theo email/username để revert
        await queryInterface.bulkDelete(
            "users",
            {
                email: "admin@gmail.com",
            },
            {}
        );
    },
};
