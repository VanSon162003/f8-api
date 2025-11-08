"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker/locale/vi");

        const videos = [];
        const youtubeIds = [
            "rHux0gMZ3Eg", "Oe421EPjeBE", "H7gY8wE1gW8", "fBNz5xF-Kx4",
            "TlB_eWDSMt4", "Ke90Tje7VS0", "3PHXvlpOkf4", "DTBta08fXGU",
            "W6NZfCO5SIk", "JKeyuyAVkJk", "aircAruvnKk", "UB1O30fR-EE",
            "qz0aGYrrlhU", "jS4aFq5-91M", "hdI2bqOjy3c", "m55PTVUrlnA",
            "bMknfKXIFA8", "kqtD5dpn9C8", "PkZNo7MFNFg", "yQw8y3qipO8"
        ];
        for (let i = 1; i <= 20; i++) {
            const youtubeId = youtubeIds[(i - 1) % youtubeIds.length];
            const tail = `${faker.word.noun()} ${faker.word.adjective()} ${faker.word.verb()} ${faker.word.noun()}`;
            videos.push({
                youtube_id: youtubeId,
                video_id: `https://www.youtube.com/watch?v=${youtubeId}`,
                title: `Video ${i}: ${tail}`,
                description: `${faker.word.words(20)}. ${faker.word.words(18)}.`,
                thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
                duration: faker.helpers.arrayElement(["03:15", "12:45", "05:30"]),
                views_count: faker.number.int({ min: 100, max: 10000 }),
                likes_count: faker.number.int({ min: 10, max: 500 }),
                comments_count: faker.number.int({ min: 0, max: 100 }),
                is_featured: faker.datatype.boolean(),
                published_at: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await queryInterface.bulkInsert("videos", videos, { ignoreDuplicates: true });
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("videos", null, {});
    },
};
