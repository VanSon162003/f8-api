const authService = require("@/service/admin/auth.service");
const response = require("@/utils/response");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        response.success(res, 200, result);
    } catch (error) {
        response.error(res, error.statusCode || 500, error.message);
    }
};

module.exports = {
    login,
};
