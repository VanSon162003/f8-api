"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker/locale/vi");

        const courses = [];
        const courseTitles = [
            "Lập trình JavaScript cơ bản",
            "React.js từ cơ bản đến nâng cao",
            "Node.js & Express toàn tập",
            "HTML & CSS cơ bản cho người mới",
            "MongoDB cho người mới bắt đầu",
            "Git & GitHub nâng cao",
            "TypeScript chuyên sâu",
            "Vue.js toàn tập",
            "Next.js thực chiến",
            "Testing với Jest",
        ];

        const usedSlugs = new Set();

        for (let i = 0; i < courseTitles.length; i++) {
            const titleBase = courseTitles[i];
            const isPro = faker.datatype.boolean();

            // Tạo slug duy nhất
            let slug = faker.helpers.slugify(titleBase.toLowerCase());
            let suffix = 1;
            while (usedSlugs.has(slug)) {
                slug = `${slug}-${suffix}`.slice(0, 255);
                suffix++;
            }
            usedSlugs.add(slug);

            // Sinh giá cho khóa học
            let price = 0;
            let old_price = 0;
            if (isPro) {
                price = faker.number.float({
                    min: 150000,
                    max: 800000,
                    precision: 1000,
                });
                old_price = Math.round(
                    price * faker.number.float({ min: 1.1, max: 1.4 })
                );
            }

            // Random creator_id (giả sử đã có 5 users trong bảng users)
            const creator_id = faker.number.int({ min: 1, max: 5 });

            courses.push({
                creator_id,
                title: titleBase,
                description: faker.lorem.paragraphs(2),
                thumbnail: faker.image.urlLoremFlickr({
                    category: "technology",
                }),
                slug,
                what_you_learn: faker.lorem.sentences(3),
                requirement: "Kiến thức cơ bản về lập trình",
                level: faker.helpers.arrayElement([
                    "beginner",
                    "intermediate",
                    "advanced",
                ]),
                total_track: faker.number.int({ min: 3, max: 8 }),
                total_lesson: faker.number.int({ min: 20, max: 60 }),
                total_view: faker.number.int({ min: 500, max: 50000 }),
                total_duration: faker.number.int({ min: 100, max: 600 }),
                is_pro: isPro,
                old_price,
                price,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("courses", courses, {
            ignoreDuplicates: true,
        });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("courses", null, {});
    },
};
