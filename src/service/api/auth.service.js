const dotenv = require("dotenv");
dotenv.config();

const db = require("@/db/models");
const { User, AccessToken, Queue, UserActivity, Course } = db;
const bcrypt = require("@/utils/bcrypt");
const jwt = require("./jwt.service");
const jwtService = require("./jwt.service");
const { Op } = require("sequelize");

const refreshTokenService = require("@/service/api/refreshToken.service");
const { where } = require("sequelize");

const notificationService = require("@/service/api/notifications.service");

// Cập nhật hoặc tạo mới user_activity cho user theo ngày và loại hành động
const updateUserActivity = async (userId, activityType = "all") => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [activity, created] = await UserActivity.findOrCreate({
        where: {
            user_id: userId,
            activity_date: today,
        },
        defaults: {
            user_id: userId,
            activity_date: today,
            activity_type: activityType,
            activity_count: 1,
        },
    });
    if (!created) {
        activity.activity_count += 1;
        await activity.save();
    }
};

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

    // If user enabled two-factor, return a temporary token to continue 2FA flow
    if (user.two_factor_enabled) {
        const tmpToken = jwtService.generateTmpToken(userId);
        return { require2fa: true, tmpToken };
    }

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

                include: [
                    {
                        model: User,
                        as: "creator",
                        attributes: ["id", "full_name", "username", "avatar"],
                    },

                    {
                        model: User,
                        as: "users",
                        attributes: ["id", "full_name", "username", "avatar"],
                    },
                ],
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

    // Ghi nhận hoạt động follow
    await updateUserActivity(currentUser.id, "follow");

    // Send follow notification
    try {
        await notificationService.sendFollowNotification(
            target.id,
            currentUser
        );
    } catch (err) {
        console.error("Error sending follow notification:", err.message);
    }

    // Queue email notification
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

    // Ghi nhận hoạt động unfollow
    await updateUserActivity(currentUser.id, "unfollow");

    return true;
};

const updateCurrentUser = async (currentUser, file, body) => {
    if (!currentUser) {
        return response.error(res, 401, "Unauthorized");
    }

    // Fields that can be updated from the formData
    // If a field is provided (even empty), we set it; otherwise default to null per requirement
    const socialMap = {
        website: "website_url",
        github: "github_url",
        facebook: "facebook_url",
        linkedin: "linkedkin_url",
        youtube: "youtube_url",
        tiktok: "tiktok_url",
    };

    const updatable = {};

    // base fields
    updatable.full_name = body.full_name;
    updatable.username = body.username;
    updatable.about = body.about || null;

    // social fields
    Object.keys(socialMap).forEach((k) => {
        updatable[socialMap[k]] = body[k] || null;
    });

    // avatar: if a file is uploaded, store it; if not provided in body then set null
    if (file) {
        const fs = require("fs");
        const path = require("path");

        const uploadDir = path.join(__dirname, "../../uploads/imgs");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        const filename = `${basename}-${Date.now()}${ext}`;
        const destPath = path.join(uploadDir, filename);

        // move file from tmp to dest
        fs.renameSync(file.path, destPath);

        // Save public path (you may want to store only relative path depending on your setup)
        updatable.avatar = `uploads/imgs/${filename}`;
    }

    // Update user (overwrite with provided values or null)
    await User.update(updatable, { where: { id: currentUser.id } });

    // fetch updated user
    const updated = await User.findOne({ where: { id: currentUser.id } });

    return updated;
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
    updateUserActivity,
    updateCurrentUser,
};
