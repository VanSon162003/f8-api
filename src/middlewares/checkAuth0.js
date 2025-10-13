require("dotenv").config();

const { expressjwt: jwt } = require("express-jwt");
const jwks = require("jwks-rsa");

const checkAuth0 = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    }),
    audience: process.env.AUTH0_AUDIENCE,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ["RS256"],
    requestProperty: "user",
});

module.exports = checkAuth0;
