"use strict";

const { QueryInterface } = require("sequelize");
const crypto = require("crypto");

module.exports = {
    async up(queryInterface) {
        const { faker } = await import("@faker-js/faker/locale/vi");

        const users = [];
        const usedUsernames = new Set();
        const usedEmails = new Set();
        for (let i = 1; i <= 20; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const fullName = `${firstName} ${lastName}`;
            let baseUsername = faker.internet
                .username({ firstName, lastName })
                .toLowerCase()
                .replace(/\./g, "_");
            baseUsername = baseUsername.replace(/[^a-z0-9_]/g, "");
            baseUsername = baseUsername.slice(0, 30) || `user${i}`;

            // ensure unique username
            let username = baseUsername;
            let suffix = 1;
            while (usedUsernames.has(username)) {
                const candidate = `${baseUsername}_${suffix}`.slice(0, 50);
                username = candidate;
                suffix++;
            }
            usedUsernames.add(username);

            // email derived from username and constrained to 50 chars
            const domain = "fullstack.edu.vn";
            let emailLocal = username;
            // ensure total length <= 50
            const maxLocalLen = 50 - ("@".length + domain.length);
            emailLocal = emailLocal.slice(0, Math.max(1, maxLocalLen));
            let email = `${emailLocal}@${domain}`;
            let emailSuffix = 1;
            while (usedEmails.has(email)) {
                const pad = `_${emailSuffix}`;
                const trimmedLocal = emailLocal.slice(
                    0,
                    Math.max(1, maxLocalLen - pad.length)
                );
                email = `${trimmedLocal}${pad}@${domain}`;
                emailSuffix++;
            }
            usedEmails.add(email);
            const password = faker.internet.password({ length: 12 });
            const avatar = faker.image.avatar();
            const title = faker.person.jobTitle();
            // faker.lorem.paragraph({ sentences: 3 }) occasionally throws with vi locale
            const about = faker.lorem.paragraph();
            const address = faker.location.streetAddress();

            users.push({
                frist_name: firstName,
                last_name: lastName,
                full_name: fullName,
                email,
                password: password
                    ? crypto.createHash("sha256").update(password).digest("hex")
                    : null,
                two_factor_enabled: faker.datatype.boolean(),
                username,
                avatar,
                title,
                about,
                posts_count: faker.number.int({ min: 0, max: 10 }),
                follower_count: faker.number.int({ min: 0, max: 50 }),
                following_count: faker.number.int({ min: 0, max: 30 }),
                address,
                website_url: faker.internet.url(),
                github_url: `https://github.com/${username}`,
                facebook_url: `https://facebook.com/${username}`,
                linkedkin_url: `https://linkedin.com/in/${username}`,
                youtube_url: faker.internet.url(),
                tiktok_url: `https://tiktok.com/@${username}`,
                verify_at: faker.date.past(),
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        try {
            // Log a sample record for debugging
            // eslint-disable-next-line no-console
            await queryInterface.bulkInsert("users", users, {});
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("Users seeder failed:", err);
            throw err;
        }
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("users", null, {});
    },
};
