const authService = require("@/service/auth.service");
const response = require("@/utils/response");
const getMe = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return response.error(res, 401, "Unauthorized");
        }
        response.success(res, 200, user);
    } catch (error) {
        response.error(res, 500, "Server error");
    }
};

const register = async (req, res) => {
    try {
        const { token } = await authService.register(req.body);

        response.success(res, 201, token);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const login = async (req, res) => {
    try {
        const data = await authService.login(req.body);

        response.success(res, 201, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const logout = async (req, res) => {
    try {
        await authService.logout(req.body);

        response.success(res, 201);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const authenticateAuth0 = async (req, res) => {
    try {
        const data = await authService.authenticateAuth0(req.body.user);

        if (data.type === "register") {
            return response.success(res, 201, data.token);
        } else {
            const { type, ...userData } = data;
            return response.success(res, 201, userData);
        }
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const forgotPassword = async (req, res) => {
    const token = req.query.token;
    const password = req.body.password;

    try {
        await authService.forgotPassword(token, password);

        response.success(res, 201);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const verifyEmail = async (req, res) => {
    try {
        await authService.verifyEmail(req.query.token);

        response.success(res, 200, "success verified");
    } catch (error) {
        response.error(res, 403, error.message);
    }
};

const resendEmail = async (req, res) => {
    try {
        await authService.resendEmail(req.body.email, req.body.job);

        response.success(res, 200, "success resend email");
    } catch (error) {
        response.error(res, 403, error.message);
    }
};

const refreshToken = async (req, res) => {
    try {
        const tokenData = await authService.refreshAccessToken(
            req.body.refresh_token
        );
        response.success(res, 200, tokenData);
    } catch (error) {
        response.error(res, 403, error.message);
    }
};

module.exports = {
    getMe,
    register,
    login,
    refreshToken,
    logout,
    verifyEmail,
    resendEmail,
    forgotPassword,
    authenticateAuth0,
};
