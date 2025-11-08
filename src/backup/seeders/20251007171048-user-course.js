"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker");

        const userCourses = [];
        const usedPairs = new Set();
        for (let i = 1; i <= 50; i++) {
            const userId = faker.number.int({ min: 1, max: 20 });
            const courseId = faker.number.int({ min: 1, max: 10 });
            const key = `${userId}:${courseId}`;
            if (usedPairs.has(key)) continue;
            usedPairs.add(key);
            userCourses.push({
                user_id: userId,
                course_id: courseId,
                completed_at: faker.datatype.boolean() ? new Date() : null,
                progress_percentage: Number(
                    faker.number.float({ min: 0, max: 100, precision: 0.01 }).toFixed(2)
                ),
                last_accessed_at: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("user_course", userCourses, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("user_course", null, {});
    },
};
