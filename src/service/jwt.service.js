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

// Short-lived temporary token used to identify a user awaiting 2FA verification
const generateTmpToken = (userId, expires = 300) => {
    const token = jwt.sign({ userId, tfa: true }, JWT_SECRET, {
        expiresIn: expires,
    });

    return token;
};

const verifyAccessToken = (token, secret = JWT_SECRET) => {
    try {
        const payload = jwt.verify(token, secret);

        return payload;
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    generateAccessToken,
    generateTmpToken,
    verifyAccessToken,
};
