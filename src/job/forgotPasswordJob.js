const transporter = require("../config/mailer");
const loadEmail = require("../utils/loadEmail");
const { User } = require("../db/models");
const jwtService = require("../service/api/jwt.service");
const { where } = require("sequelize");

async function forgotPasswordJob(job) {
    const { userId } = JSON.parse(job.dataValues.payload);

    const user = await User.findOne({
        where: {
            id: userId,
        },
    });

    // Tạo link xác thực cho userId
    const { access_token } = jwtService.generateAccessToken(
        userId,
        process.env.MAIL_JWT_SECRET,
        60 * 5
    );

    const CLIENT_URL = process.env.CLIENT_URL;

    const verifyUrl = `${CLIENT_URL}forgot-password?token=${access_token}`;

    const data = { token: access_token, userId, verifyUrl };

    // Load email từ template ejs
    const template = await loadEmail("email/forgotPassword", data);

    await transporter.sendMail({
        from: "sonnv@fullstack.edu.vn",
        subject: "Verification email forgot password",
        to: user.dataValues.email,
        html: template,
    });
}
module.exports = forgotPasswordJob;
