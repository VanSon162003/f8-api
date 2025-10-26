const Joi = require("joi");

const login = {
    body: Joi.object().keys({
        email: Joi.string().email().required().messages({
            "string.email": "Email không hợp lệ",
            "any.required": "Email là bắt buộc",
            "string.empty": "Email không được để trống",
        }),
        password: Joi.string().min(6).required().messages({
            "string.min": "Mật khẩu phải có ít nhất {#limit} ký tự",
            "any.required": "Mật khẩu là bắt buộc",
            "string.empty": "Mật khẩu không được để trống",
        }),
    }),
};

module.exports = {
    login,
};
