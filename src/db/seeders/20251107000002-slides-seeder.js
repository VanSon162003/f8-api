"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert("slides", [
            {
                title: "Học Lập Trình Frontend",
                description:
                    "Khóa học HTML, CSS, JavaScript từ cơ bản đến nâng cao",
                buttonText: "Xem khóa học",
                image: "https://files.fullstack.edu.vn/f8-prod/banners/36/67ef3dad5d92b.png",
                className: "slide-blue",
                customStyles: JSON.stringify({
                    backgroundColor: "#4158D0",
                    backgroundImage:
                        "linear-gradient(to right, rgb(44, 140, 188), rgb(88, 200, 199))",
                    color: "white",
                }),
                order: 1,
                isActive: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                title: "Học Node.js & Express",
                description: "Xây dựng ứng dụng backend với Node.js và Express",
                buttonText: "Đăng ký ngay",
                image: "https://files.fullstack.edu.vn/f8-prod/banners/37/66b5a6b16d31a.png",
                className: "slide-green",
                customStyles: JSON.stringify({
                    backgroundColor: "#0093E9",
                    backgroundImage:
                        "linear-gradient(to right, rgb(138, 10, 255), rgb(96, 6, 255))",
                    color: "white",
                }),
                order: 2,
                isActive: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete("slides", null, {});
    },
};
