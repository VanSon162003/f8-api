const response = require("../utils/response");
const { User, AccessToken, Notification, Course } = require("../db/models");
const jwtService = require("../service/jwt.service");
const { or } = require("sequelize");

async function checkAuth(req, res, next) {
    try {
        const token = req.headers?.authorization?.replace("Bearer ", "");

        if (!token) {
            throw new Error("Token was not provided");
        }

        const tokenExits = await AccessToken.findOne({
            where: {
                access_token: token,
            },
        });

        if (tokenExits) {
            return response.error(res, 401, "Token is invalid");
        }

        const payload = jwtService.verifyAccessToken(token);

        const user = await User.findOne({
            where: { id: payload.userId },

            include: [
                {
                    model: Notification,
                    required: false,
                    as: "notifications",
                },
            ],

            order: [
                [
                    { model: Notification, as: "notifications" },
                    "created_at",
                    "DESC",
                ],
            ],
        });

        if (!user) {
            return response.error(res, 401, "User does not exist");
        }

        req.user = user;
        next();
    } catch (error) {
        next();
    }
}

module.exports = checkAuth;
