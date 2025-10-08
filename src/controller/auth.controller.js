const authService = require("@/service/auth.service");
const response = require("@/utils/response");
const getMe = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            response.error(res, 401, "Unauthorized");
        }
        response.success(res, 200, user);
    } catch (error) {
        response.error(res, 500, "Server error");
    }
};

const register = async (req, res) => {
    try {
        const data = await authService.register(req.body);

        response.success(res, 201, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

module.exports = {
    getMe,
    register,
};
