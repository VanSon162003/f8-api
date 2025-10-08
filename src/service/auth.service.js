const { User, AccessToken } = require("@/db/models");
const bcrypt = require("@/utils/bcrypt");
const jwt = require("./jwt.service");
const jwtService = require("./jwt.service");

const refreshTokenService = require("./refreshToken.service");
const { where } = require("sequelize");

const register = async (data) => {
    const emailExits = await User.findOne({ where: { email: data.email } });
    if (emailExits) {
        throw new Error("Email already exists");
    }

    const user = await User.create({
        email: data.email,
        last_name: data.last_name,
        frist_name: data.frist_name,

        password: await bcrypt.hash(data.password),
    });

    const userId = user.id;
    const token = jwt.generateAccessToken(userId);

    return {
        userId,
        token,
    };
};

const login = async (data) => {
    const user = await User.findOne({ where: { email: data.email } });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
        throw new Error("Invalid email or password");
    }

    if (!user.verify_at) {
        throw new Error("Please verify your email to login");
    }

    const userId = user.id;
    const tokenData = jwt.generateAccessToken(userId);
    const refresh_token = await refreshTokenService.createRefreshToken(userId);

    return {
        ...tokenData,
        refresh_token: refresh_token.token,
    };
};

const logout = async (data) => {
    const { refresh_token, token } = data;

    const refreshTokenExits = await refreshTokenService.findValidRefreshToken(
        refresh_token
    );

    const tokenExits = await AccessToken.findOne({
        where: {
            access_token: token,
        },
    });

    if (!tokenExits) {
        await AccessToken.create({ access_token: token });
    }

    if (refreshTokenExits) {
        await refreshTokenService.deleteRefreshToken(refreshTokenExits);
    }

    return true;
};

const refreshAccessToken = async (refreshTokenString) => {
    const refreshToken = await refreshTokenService.findValidRefreshToken(
        refreshTokenString
    );

    if (!refreshToken) {
        throw new Error("Refresh invalid");
    }

    const tokenData = jwtService.generateAccessToken(refreshToken.user_id);
    await refreshTokenService.deleteRefreshToken(refreshToken);

    const newRefreshToken = await refreshTokenService.createRefreshToken(
        refreshToken.user_id
    );

    return {
        ...tokenData,
        refresh_token: newRefreshToken.token,
    };
};

module.exports = {
    register,
    login,
    logout,
    refreshAccessToken,
};
