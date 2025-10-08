const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN, TOKEN_TYPE } = require("../config/auth");

const generateAccessToken = (
    userId,
    secret = JWT_SECRET,
    expires = JWT_EXPIRES_IN
) => {
    const token = jwt.sign({ userId }, secret, {
        expiresIn: expires,
    });

    return {
        access_token: token,
        token_type: TOKEN_TYPE,
        expires_in: JWT_EXPIRES_IN,
    };
};

const verifyAccessToken = (token, secret = JWT_SECRET) => {
    try {
        const payload = jwt.verify(token, secret);
        console.log(payload);

        return payload;
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    generateAccessToken,
    verifyAccessToken,
};
