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

const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await authService.getUserProfile(username);

        if (!user) {
            return response.error(res, 404, "User not found");
        }

        response.success(res, 200, user);
    } catch (error) {
        response.error(res, 500, error.message);
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

const followUser = async (req, res) => {
    try {
        const username = req.params.username;
        const currentUser = req.user;
        if (!currentUser) return response.error(res, 401, "Unauthorized");

        await authService.followUser(currentUser, username);

        response.success(res, 200, "followed");
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const unfollowUser = async (req, res) => {
    try {
        const username = req.params.username;
        const currentUser = req.user;
        if (!currentUser) return response.error(res, 401, "Unauthorized");

        await authService.unfollowUser(currentUser, username);

        response.success(res, 200, "unfollowed");
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const updateUser = async (req, res) => {
    try {
        const currentUser = req.user;

        const data = authService.updateCurrentUser(
            currentUser,
            req.file,
            req.body
        );

        response.success(res, 200, data);
    } catch (error) {
        console.error("updateUser error:", error);
        response.error(res, 500, error.message || "Update failed");
    }
};

const changePassword = async (req, res) => {
    try {
        const currentUser = req.user;

        if (!currentUser) {
            return response.error(res, 401, "Unauthorized");
        }

        const { oldPassword, newPassword } = req.body || {};

        if (!oldPassword || !newPassword) {
            return response.error(
                res,
                400,
                "Both oldPassword and newPassword are required"
            );
        }

        if (typeof newPassword !== "string" || newPassword.length < 8) {
            return response.error(
                res,
                400,
                "New password must be at least 8 characters long"
            );
        }

        // Disallow changing password for social accounts registered via auth0
        // In this project, social accounts created via Auth0 set `auth0_id` on the user record.
        // Only allow password change when auth0_id is null (i.e., normal gmail/email-registered account)
        if (currentUser.auth0_id) {
            return response.error(
                res,
                403,
                "Password change is not allowed for social login accounts"
            );
        }

        // Ensure user has a stored password
        if (!currentUser.password) {
            return response.error(
                res,
                403,
                "No local password set for this account"
            );
        }

        // Verify old password
        const valid = await require("@/utils/bcrypt").compare(
            oldPassword,
            currentUser.password
        );
        if (!valid) {
            return response.error(res, 400, "Old password is incorrect");
        }

        // Hash new password and save
        const hashed = await require("@/utils/bcrypt").hash(newPassword);

        const { User } = require("@/db/models");
        const rateLimit = require("@/utils/2faRateLimit");
        await User.update(
            { password: hashed },
            { where: { id: currentUser.id } }
        );

        response.success(res, 200, "Password changed successfully");
    } catch (error) {
        console.error("changePassword error:", error);
        response.error(res, 500, error.message || "Change password failed");
    }
};

// Verify login with tmpToken + TOTP token, then issue real access token
const login2fa = async (req, res) => {
    try {
        const { tmpToken, token } = req.body || {};
        if (!tmpToken || !token)
            return response.error(res, 400, "tmpToken and token required");

        const jwtServiceLocal = require("@/service/jwt.service");
        const payload = jwtServiceLocal.verifyAccessToken(tmpToken);
        if (!payload || !payload.userId || !payload.tfa)
            return response.error(res, 400, "Invalid tmpToken");

        const { User } = require("@/db/models");
        const user = await User.findOne({ where: { id: payload.userId } });
        if (!user) return response.error(res, 404, "User not found");

        const now = new Date();

        // Check lockout via Redis first (faster). Fall back to DB lock field.
        const isLockedRedis = await rateLimit.isLocked(user.id);
        if (isLockedRedis)
            return response.error(res, 429, "Too many attempts. Try later.");
        if (
            user.two_factor_locked_until &&
            new Date(user.two_factor_locked_until) > now
        ) {
            return response.error(res, 429, "Too many attempts. Try later.");
        }

        const speakeasy = require("speakeasy");
        const cryptoUtil = require("@/utils/crypto");
        const bcryptUtil = require("@/utils/bcrypt");

        let verified = false;

        // Attempt TOTP verification first
        if (user.two_factor_secret) {
            let secretPlain = null;
            try {
                secretPlain = cryptoUtil.decrypt(user.two_factor_secret);
            } catch (err) {
                console.error("decrypt secret failed:", err);
            }

            if (secretPlain) {
                verified = speakeasy.totp.verify({
                    secret: secretPlain,
                    encoding: "base32",
                    token,
                    window: 1,
                });
            }
        }

        // If not TOTP-verified, try recovery codes
        if (!verified && user.two_factor_recovery_codes) {
            try {
                const rcodes = JSON.parse(
                    user.two_factor_recovery_codes || "[]"
                );
                // rcodes stored as hashed values
                for (const hashed of rcodes) {
                    const match = await bcryptUtil.compare(token, hashed);
                    if (match) {
                        verified = true;
                        // remove this recovery code (one-time use)
                        const remaining = rcodes.filter((h) => h !== hashed);
                        await User.update(
                            {
                                two_factor_recovery_codes:
                                    JSON.stringify(remaining),
                            },
                            { where: { id: user.id } }
                        );
                        break;
                    }
                }
            } catch (err) {
                console.error("recovery codes parse error", err);
            }
        }

        if (!verified) {
            // increment failed count in Redis; lock if exceeded
            const failed = await rateLimit.incrFailed(user.id);
            const MAX = 5;
            if (failed >= MAX) {
                // lock for 5 minutes
                await rateLimit.lockUntil(user.id, 5 * 60);
            }
            return response.error(res, 400, "Invalid 2FA token");
        }

        // success: reset redis counter and ensure DB lock fields cleared
        try {
            await rateLimit.reset(user.id);
        } catch (err) {
            // ignore redis errors
        }
        await User.update(
            { two_factor_failed_count: 0, two_factor_locked_until: null },
            { where: { id: user.id } }
        );

        // generate final tokens
        const jwt = require("@/service/jwt.service");
        const tokenData = jwt.generateAccessToken(user.id);
        const refresh_token =
            await require("@/service/refreshToken.service").createRefreshToken(
                user.id
            );

        response.success(res, 200, {
            ...tokenData,
            refresh_token: refresh_token.token,
        });
    } catch (error) {
        console.error("login2fa error:", error);
        response.error(res, 500, error.message || "2FA login failed");
    }
};

// Two-factor authentication (TOTP) setup/verify/disable
const twoFactorSetup = async (req, res) => {
    try {
        const currentUser = req.user;
        if (!currentUser) return response.error(res, 401, "Unauthorized");

        const speakeasy = require("speakeasy");
        const qrcode = require("qrcode");

        // Generate a TOTP secret for the user
        const secret = speakeasy.generateSecret({
            name: `f8-app (${currentUser.email || currentUser.username})`,
        });

        // Generate QR code data URL
        const otpAuthUrl = secret.otpauth_url;
        const qrDataUrl = await qrcode.toDataURL(otpAuthUrl);

        // Do not persist secret yet — persist after successful verification
        response.success(res, 200, { secret: secret.base32, qr: qrDataUrl });
    } catch (error) {
        console.error("twoFactorSetup error:", error);
        response.error(res, 500, error.message || "2FA setup failed");
    }
};

const twoFactorVerify = async (req, res) => {
    try {
        const currentUser = req.user;
        if (!currentUser) return response.error(res, 401, "Unauthorized");

        const { token, secret } = req.body || {};
        if (!token || !secret)
            return response.error(res, 400, "Token and secret required");

        const speakeasy = require("speakeasy");

        const verified = speakeasy.totp.verify({
            secret,
            encoding: "base32",
            token,
            window: 1,
        });

        if (!verified) return response.error(res, 400, "Invalid token");

        // Save secret (encrypted), enable two-factor, generate recovery codes
        const cryptoUtil = require("@/utils/crypto");
        const bcryptUtil = require("@/utils/bcrypt");
        const { User } = require("@/db/models");

        const encrypted = cryptoUtil.encrypt(secret);

        // generate recovery codes (10) and store hashed
        const generateRecoveryCodes = (count = 10) => {
            const codes = [];
            for (let i = 0; i < count; i++) {
                const c = Math.random().toString(36).slice(2, 10).toUpperCase();
                codes.push(c);
            }
            return codes;
        };

        const plainCodes = generateRecoveryCodes(10);
        const hashedCodes = [];
        for (const c of plainCodes) {
            const h = await bcryptUtil.hash(c);
            hashedCodes.push(h);
        }

        await User.update(
            {
                two_factor_enabled: true,
                two_factor_secret: encrypted,
                two_factor_recovery_codes: JSON.stringify(hashedCodes),
            },
            { where: { id: currentUser.id } }
        );

        response.success(res, 200, {
            message: "2FA enabled",
            recovery_codes: plainCodes,
        });
    } catch (error) {
        console.error("twoFactorVerify error:", error);
        response.error(res, 500, error.message || "2FA verify failed");
    }
};

const twoFactorDisable = async (req, res) => {
    try {
        const currentUser = req.user;
        if (!currentUser) return response.error(res, 401, "Unauthorized");

        const { token } = req.body || {};
        if (!token) return response.error(res, 400, "Token required");

        const speakeasy = require("speakeasy");

        // Use the stored secret to validate
        const secret = currentUser.two_factor_secret;
        if (!secret) return response.error(res, 400, "2FA not configured");

        const cryptoUtil = require("@/utils/crypto");
        const bcryptUtil = require("@/utils/bcrypt");
        const { User } = require("@/db/models");

        let secretPlain = null;
        try {
            secretPlain = cryptoUtil.decrypt(
                secret || currentUser.two_factor_secret
            );
        } catch (err) {
            // ignore
        }

        let verifiedLocal = false;
        if (secretPlain) {
            verifiedLocal = speakeasy.totp.verify({
                secret: secretPlain,
                encoding: "base32",
                token,
                window: 1,
            });
        }

        // if not verified via TOTP, try recovery codes
        if (!verifiedLocal && currentUser.two_factor_recovery_codes) {
            const rcodes = JSON.parse(
                currentUser.two_factor_recovery_codes || "[]"
            );
            for (const hashed of rcodes) {
                const match = await bcryptUtil.compare(token, hashed);
                if (match) {
                    verifiedLocal = true;
                    const remaining = rcodes.filter((h) => h !== hashed);
                    await User.update(
                        {
                            two_factor_recovery_codes:
                                JSON.stringify(remaining),
                        },
                        { where: { id: currentUser.id } }
                    );
                    break;
                }
            }
        }

        if (!verifiedLocal) return response.error(res, 400, "Invalid token");

        await User.update(
            {
                two_factor_enabled: false,
                two_factor_secret: null,
                two_factor_recovery_codes: null,
            },
            { where: { id: currentUser.id } }
        );

        response.success(res, 200, "2FA disabled");
    } catch (error) {
        console.error("twoFactorDisable error:", error);
        response.error(res, 500, error.message || "2FA disable failed");
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
    getUserProfile,
    followUser,
    unfollowUser,
    updateUser,
    changePassword,
    login2fa,
    twoFactorSetup,
    twoFactorVerify,
    twoFactorDisable,
};
