const transporter = require("../config/mailer");
const loadEmail = require("../utils/loadEmail");
const { User, Comment } = require("../db/models");
const jwtService = require("../service/jwt.service");
const { where } = require("sequelize");

async function sendNewCommentJob(job) {
    const result = JSON.parse(job.dataValues.payload);

    const userPost = await User.findByPk(result.userPostId);
    const userComment = await User.findByPk(result.userCommentId);

    const template = await loadEmail("email/newComment", {
        userPost,
        userComment,
        isHttps: function isHttps(url) {
            if (typeof url !== "string") return false;
            return url.startsWith("https://");
        },
        content: result.content,
        post: result.post,
    });

    await transporter.sendMail({
        from: "mailer@fullstack.edu.vn",
        subject: "Verification email",
        to: userPost.email,
        html: template,
    });
}
module.exports = sendNewCommentJob;
