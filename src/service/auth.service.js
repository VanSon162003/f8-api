const { User } = require("@/db/models");
const bcrypt = require("@/utils/bcrypt");
const jwt = require("./jwt.service");

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
    const token = jwt.generateAccessToken({ userId });

    return {
        userId,
        token,
    };
};
module.exports = {
    register,
};
