const dotenv = require("dotenv");
dotenv.config();

const db = require("@/db/models");
const { User, AccessToken, Queue, UserActivity, Course } = db;
const bcrypt = require("@/utils/bcrypt");
const jwt = require("./jwt.service");
const jwtService = require("./jwt.service");
const { Op } = require("sequelize");

const refreshTokenService = require("./refreshToken.service");
const { where } = require("sequelize");
const auth = require("../config/auth");

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
        auth0_id: data.auth0_id || null,
        verify_at: data.verify_at || null,
        avatar: data.avatar || null,
    });

    const userId = user.id;
    const token = jwt.generateAccessToken(userId);

    try {
        await Queue.create({
            type: "sendVerifyEmailJob",
            payload: { userId },
        });
    } catch (error) {
        console.error("Failed to create job in queue:", error);
    }

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

const authenticateAuth0 = async (data) => {
    let type = "";
    let result = null;
    const subType = data.sub.split("|")[0];

    const user = await User.findOne({ where: { auth0_id: data.sub } });

    if (!user) {
        type = "register";
        try {
            result = await register({
                email: data.email || data.sub + "@auth0.com",
                last_name:
                    subType === "facebook"
                        ? data.family_name
                        : data.name.split(" ").at(-1) || "",
                frist_name:
                    subType === "facebook"
                        ? data.given_name
                        : data.name.split(" ").splice(0, 2).join(" ") || "",
                password: "",
                auth0_id: data.sub,
                verify_at: Date.now(),
                avatar: data.picture || "",
            });
        } catch (error) {
            throw new Error(error);
        }
    } else {
        type = "login";
        try {
            result = await login({
                email: user.email,
                password: "",
            });
        } catch (error) {
            throw new Error(error);
        }
    }

    return { type, ...result };
};

const forgotPassword = async (token, password) => {
    try {
        const { userId } = jwtService.verifyAccessToken(
            token,
            process.env.MAIL_JWT_SECRET
        );

        if (!userId) {
            throw new Error("Token invalid");
        }

        const user = await User.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        user.password = await bcrypt.hash(password);
        await user.save();
    } catch (error) {
        throw new Error(error);
    }
};

const verifyEmail = async (token) => {
    try {
        const { userId } = jwtService.verifyAccessToken(
            token,
            process.env.MAIL_JWT_SECRET
        );

        if (!userId) {
            throw new Error("Token invalid");
        }

        const { dataValues: user } = await User.findOne({
            where: { id: userId },
        });

        if (user.verify_at) {
            throw new Error("Email already verified");
        }

        await User.update(
            { verify_at: Date.now() },
            {
                where: { id: userId },
            }
        );
    } catch (error) {
        throw new Error(error);
    }
};

const resendEmail = async (email, job) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error(`Email không tồn tại`);
    }
    if (user.verify_at && job === "sendVerifyEmailJob") {
        throw new Error("Email đã được xác thực");
    }

    const userId = user.id;

    try {
        await Queue.create({
            type: job,
            payload: { userId },
        });
    } catch (error) {
        console.error("Failed to create job in queue:", error);
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

const getUserProfile = async (username) => {
    const cleanUsername = username.replace(/^@/, "");
    const user = await User.findOne({
        where: { username: cleanUsername },

        include: [
            {
                model: Course,
                as: "courses",
                through: { attributes: [] },
                // attributes: ['id', 'name', 'thumbnail', 'price', 'is_pro']
            },
            {
                model: UserActivity,
                as: "activities",
                limit: 10,
                order: [["created_at", "DESC"]],
                // attributes: ['id', 'activity_type', 'content', 'created_at']
            },
            {
                model: User,
                as: "followers",
                attributes: ["id", "username", "avatar", "full_name"],
                through: { attributes: [] },
            },
            {
                model: User,
                as: "following",
                attributes: ["id", "username", "avatar", "full_name"],
                through: { attributes: [] },
            },
        ],
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

const followUser = async (currentUser, username) => {
    const cleanUsername = username.replace(/^@/, "");
    const target = await User.findOne({ where: { username: cleanUsername } });
    if (!target) throw new Error("User not found");

    if (currentUser.id === target.id) {
        throw new Error("Cannot follow yourself");
    }

    // check if already following
    const existing = await db.Follow.findOne({
        where: { following_id: currentUser.id, followed_id: target.id },
    });

    if (existing) return true; // already following

    await db.Follow.create({
        following_id: currentUser.id,
        followed_id: target.id,
    });

    // update counts
    await User.increment({ follower_count: 1 }, { where: { id: target.id } });
    await User.increment(
        { following_count: 1 },
        { where: { id: currentUser.id } }
    );

    // Optionally: create notification/queue job
    try {
        await Queue.create({
            type: "sendNewFollowerEmail",
            payload: { followerId: currentUser.id, followingId: target.id },
        });
    } catch (err) {
        // ignore queue errors
        console.error("Queue job error (follow):", err.message);
    }

    return true;
};

const unfollowUser = async (currentUser, username) => {
    const cleanUsername = username.replace(/^@/, "");
    const target = await User.findOne({ where: { username: cleanUsername } });
    if (!target) throw new Error("User not found");

    if (currentUser.id === target.id) {
        throw new Error("Cannot unfollow yourself");
    }

    const existing = await db.Follow.findOne({
        where: { following_id: currentUser.id, followed_id: target.id },
    });

    if (!existing) return true; // nothing to do

    await existing.destroy();

    // update counts
    await User.decrement({ follower_count: 1 }, { where: { id: target.id } });
    await User.decrement(
        { following_count: 1 },
        { where: { id: currentUser.id } }
    );

    return true;
};

module.exports = {
    register,
    login,
    logout,
    refreshAccessToken,
    verifyEmail,
    resendEmail,
    forgotPassword,
    authenticateAuth0,
    getUserProfile,
    followUser,
    unfollowUser,
};
