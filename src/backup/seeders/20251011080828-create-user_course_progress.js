"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        // Dùng dynamic import cho ES module
        const { faker } = await import("@faker-js/faker");

        const progressData = [];

        // Giả sử có 5 user, 3 course, mỗi user học qua 1–2 khóa
        for (let userId = 1; userId <= 5; userId++) {
            const totalCourses = faker.number.int({ min: 1, max: 2 });

            for (let i = 0; i < totalCourses; i++) {
                const courseId = faker.number.int({ min: 1, max: 3 });

                // Giả định mỗi khóa có khoảng 10 bài học
                const totalLessons = 10;
                const learnedCount = faker.number.int({
                    min: 1,
                    max: totalLessons,
                });
                const learnedLessons = Array.from(
                    { length: learnedCount },
                    (_, idx) => idx + 1
                );

                const progress = Number(
                    ((learnedCount / totalLessons) * 100).toFixed(2)
                );
                const isCompleted = learnedCount === totalLessons;
                const lastViewedAt = faker.date.recent({ days: 10 });

                progressData.push({
                    user_id: userId,
                    course_id: courseId,
                    current_lesson_id:
                        learnedLessons[learnedLessons.length - 1],
                    learned_lessons: JSON.stringify(learnedLessons),
                    progress,
                    is_completed: isCompleted,
                    last_viewed_at: lastViewedAt,
                    created_at: faker.date.past({ years: 1 }),
                    updated_at: new Date(),
                });
            }
        }

        await queryInterface.bulkInsert(
            "user_course_progress",
            progressData,
            {}
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("user_course_progress", null, {});
    },
};
