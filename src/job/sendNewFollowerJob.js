const transporter = require("../config/mailer");
const loadEmail = require("../utils/loadEmail");
const { User, Comment } = require("../db/models");
const jwtService = require("../service/jwt.service");
const { where } = require("sequelize");

async function sendNewCommentJob(job) {
    const { following, follower } = JSON.parse(job.dataValues.payload);

    const template = await loadEmail("email/newFollower", {
        following,
        follower,
        isHttps: function isHttps(url) {
            if (typeof url !== "string") return false;
            return url.startsWith("https://");
        },
    });

    await transporter.sendMail({
        from: "mailer@fullstack.edu.vn",
        subject: "send email new follower",
        to: following.email,
        html: template,
    });
}
module.exports = sendNewCommentJob;
