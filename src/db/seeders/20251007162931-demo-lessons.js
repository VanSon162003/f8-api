"use strict";

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker/locale/vi");

        const lessons = [];
        const youtubeIds = [
            "rHux0gMZ3Eg",
            "Oe421EPjeBE",
            "H7gY8wE1gW8",
            "fBNz5xF-Kx4",
            "TlB_eWDSMt4",
            "Ke90Tje7VS0",
            "3PHXvlpOkf4",
            "DTBta08fXGU",
            "W6NZfCO5SIk",
            "JKeyuyAVkJk",
            "aircAruvnKk",
            "UB1O30fR-EE",
            "qz0aGYrrlhU",
            "jS4aFq5-91M",
            "hdI2bqOjy3c",
            "m55PTVUrlnA",
            "bMknfKXIFA8",
            "kqtD5dpn9C8",
            "PkZNo7MFNFg",
            "yQw8y3qipO8",
        ];

        const lessonTypes = ["Video", "Lesson", "Challenge", "Question"];

        for (let i = 1; i <= 100; i++) {
            const trackId = Math.ceil(i / 3);

            const tail = `${faker.word.noun()} ${faker.word.adjective()} ${faker.word.verb()} ${faker.word.noun()}`;
            const title = `Bài ${i}: ${tail}`;
            const slug = `lesson-${i}-${faker.helpers.slugify(
                tail.toLowerCase()
            )}`;
            const videoId = youtubeIds[(i - 1) % youtubeIds.length];
            const lessonType = faker.helpers.arrayElement(lessonTypes);

            // Nội dung HTML mẫu
            const content = `
                <h2>${faker.lorem.sentence()}</h2>
                <p>${faker.lorem.paragraphs(2, "<br><br>")}</p>
                <ul>
                    <li>${faker.lorem.sentence()}</li>
                    <li>${faker.lorem.sentence()}</li>
                    <li>${faker.lorem.sentence()}</li>
                </ul>
                <p><strong>Ghi chú:</strong> ${faker.lorem.sentence()}</p>
            `;

            const thumbnail = faker.image.urlPicsumPhotos({
                width: 640,
                height: 360,
            });

            lessons.push({
                track_id: trackId,
                title,
                slug,
                thumbnail,
                lesson_type: lessonType,
                content,
                duration: faker.number.int({ min: 5, max: 30 }),
                position: (i % 10) + 1,
                video_type: "youtube",
                video_url: `https://www.youtube.com/watch?v=${videoId}`,
                video_path: null,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("lessons", lessons, {
            ignoreDuplicates: true,
        });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("lessons", null, {});
    },
};
