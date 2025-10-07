const response = require("../utils/response");
const {
    User,
    UserSetting,
    Notification,
    UserNotification,
} = require("../db/models");
const jwtService = require("../service/jwt.service");

async function checkAuth(req, res, next) {
    try {
        const token = req.headers?.authorization?.replace("Bearer ", "");

        if (!token) {
            throw new Error("Token was not provided");
        }

        const payload = jwtService.verifyAccessToken(token);

        const user = await User.findOne({
            // attributes: [
            //     "id",
            //     "email",
            //     "avatar",
            //     "first_name",
            //     "last_name",
            //     "username",
            //     "created_at",
            // ],
            where: { id: payload.userId },
            include: [
                {
                    model: UserSetting,
                    as: "settings",
                    required: false,
                },
                {
                    model: Notification,
                    required: false,
                    as: "notifications",
                    through: {
                        attributes: ["read_at", "created_at"],
                    },
                },
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
