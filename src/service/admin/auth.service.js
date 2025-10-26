const { User } = require("@/db/models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("@/config/auth");
const ApiError = require("@/utils/ApiError");

const jwtService = require("../api/jwt.service");

const login = async (email, password) => {
    // Tìm user theo email
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new ApiError(401, "Email hoặc mật khẩu không chính xác");
    }

    // Kiểm tra role
    if (user.role !== "admin") {
        throw new ApiError(403, "Bạn không có quyền truy cập");
    }

    // Kiểm tra status
    if (user.status !== "active") {
        throw new ApiError(403, "Tài khoản đã bị khóa");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Email hoặc mật khẩu không chính xác");
    }

    // Tạo JWT token
    // const token = jwt.sign(
    //     {
    //         id: user.id,
    //         email: user.email,
    //         role: user.role,
    //     },
    //     config.JWT_SECRET,
    //     {
    //         expiresIn: config.JWT_EXPIRES_IN,
    //     }
    // );

    const tokenData = jwtService.generateAccessToken(user.id);
    console.log(tokenData);

    // Trả về thông tin user và token
    return {
        user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            status: user.status,
        },
        tokenData,
    };
};

module.exports = {
    login,
};
