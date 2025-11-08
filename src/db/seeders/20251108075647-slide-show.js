"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        const slides = [
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
            {
                title: "Khóa học ReactJS",
                description:
                    "Làm chủ thư viện ReactJS và xây dựng ứng dụng chuyên nghiệp",
                buttonText: "Khám phá ngay",
                image: "https://files.fullstack.edu.vn/f8-prod/banners/20/68010e5598e64.png",
                className: "slide-purple",
                customStyles: JSON.stringify({
                    backgroundColor: "#8EC5FC",
                    backgroundImage:
                        "linear-gradient(to right, rgb(104, 40, 250), rgb(255, 186, 164))",
                    color: "black",
                }),
                order: 3,
                isActive: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                title: "Khóa học ReactJS",
                description:
                    "Làm chủ thư viện ReactJS và xây dựng ứng dụng chuyên nghiệp",
                buttonText: "Khám phá ngay",
                image: "https://files.fullstack.edu.vn/f8-prod/banners/Banner_web_ReactJS.png",
                className: "slide-purple",
                customStyles: JSON.stringify({
                    backgroundColor: "#8EC5FC",
                    backgroundImage:
                        "linear-gradient(to right, rgb(40, 119, 250), rgb(103, 23, 205))",
                    color: "black",
                }),
                order: 4,
                isActive: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                title: "Khóa học ReactJS",
                description:
                    "Làm chủ thư viện ReactJS và xây dựng ứng dụng chuyên nghiệp",
                buttonText: "Khám phá ngay",
                image: "https://files.fullstack.edu.vn/f8-prod/banners/Banner_03_youtube.png",
                className: "slide-purple",
                customStyles: JSON.stringify({
                    backgroundColor: "#8EC5FC",
                    backgroundImage:
                        "linear-gradient(to right, rgb(118, 18, 255), rgb(5, 178, 255))",
                    color: "black",
                }),
                order: 5,
                isActive: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                title: "Khóa học ReactJS",
                description:
                    "Làm chủ thư viện ReactJS và xây dựng ứng dụng chuyên nghiệp",
                buttonText: "Khám phá ngay",
                image: "https://files.fullstack.edu.vn/f8-prod/banners/Banner_04_2.png",
                className: "slide-purple",
                customStyles: JSON.stringify({
                    backgroundColor: "#8EC5FC",
                    backgroundImage:
                        "linear-gradient(to right, rgb(254, 33, 94), rgb(255, 148, 2))",
                    color: "black",
                }),
                order: 6,
                isActive: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                title: "Khóa học ReactJS",
                description:
                    "Làm chủ thư viện ReactJS và xây dựng ứng dụng chuyên nghiệp",
                buttonText: "Khám phá ngay",
                image: "https://files.fullstack.edu.vn/f8-prod/banners/20/68010e5598e64.png",
                className: "slide-purple",
                customStyles: JSON.stringify({
                    backgroundColor: "#8EC5FC",
                    backgroundImage:
                        "linear-gradient(to right, rgb(0, 126, 254), rgb(6, 195, 254))",
                    color: "black",
                }),
                order: 7,
                isActive: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        await queryInterface.bulkInsert("slides", slides, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("slides", null, {});
    },
};
