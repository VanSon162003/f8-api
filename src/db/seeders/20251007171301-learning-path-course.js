"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker");

        const pathCourses = [];
        const usedPairs = new Set();
        for (let i = 1; i <= 20; i++) {
            const pathId = faker.number.int({ min: 1, max: 5 });
            const courseId = faker.number.int({ min: 1, max: 10 });
            const key = `${pathId}:${courseId}`;
            if (usedPairs.has(key)) continue;
            usedPairs.add(key);
            pathCourses.push({
                learning_path_id: pathId,
                course_id: courseId,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert(
            "learning_path_course",
            pathCourses,
            { ignoreDuplicates: true }
        );
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("learning_path_course", null, {});
    },
};
