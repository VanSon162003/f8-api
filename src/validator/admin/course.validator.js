const Joi = require("joi");

const createCourse = {
    body: Joi.object({
        title: Joi.string().allow(null, "").messages({
            "string.empty": "Tiêu đề không được để trống",
        }),

        description: Joi.string().allow(null, "").messages({
            "string.empty": "Mô tả không được để trống",
        }),

        what_you_learn: Joi.alternatives()
            .try(Joi.string(), Joi.array().items(Joi.string()))
            .allow(null, "")
            .messages({
                "array.base": "Nội dung học phải là mảng hoặc chuỗi",
            }),

        requirement: Joi.alternatives()
            .try(Joi.string(), Joi.array().items(Joi.string()))
            .allow(null, "")
            .messages({
                "array.base": "Yêu cầu phải là mảng hoặc chuỗi",
            }),

        level: Joi.string()
            .valid("beginner", "intermediate", "advanced")
            .allow(null, "")
            .messages({
                "any.only":
                    "Cấp độ phải là 'beginner', 'intermediate' hoặc 'advanced'",
            }),

        price: Joi.number().min(0).allow(null).messages({
            "number.base": "Giá phải là số",
            "number.min": "Giá không được nhỏ hơn 0",
        }),

        old_price: Joi.number().min(0).allow(null).messages({
            "number.base": "Giá gốc phải là số",
            "number.min": "Giá gốc không được nhỏ hơn 0",
        }),

        is_pro: Joi.boolean().allow(null).messages({
            "boolean.base": "Trạng thái khóa học Pro phải là true/false",
        }),

        thumbnail: Joi.string().allow(null, "").messages({
            "string.base": "Thumbnail phải là chuỗi tên file hoặc URL",
        }),
    }),
};

const updateCourse = {
    params: Joi.object({
        id: Joi.number().required().messages({
            "number.base": "ID không hợp lệ",
            "any.required": "ID là bắt buộc",
        }),
    }),
    body: Joi.object({
        title: Joi.string().allow(null, "").messages({
            "string.empty": "Tiêu đề không được để trống",
        }),

        description: Joi.string().allow(null, "").messages({
            "string.empty": "Mô tả không được để trống",
        }),

        what_you_learn: Joi.alternatives()
            .try(Joi.string(), Joi.array().items(Joi.string()))
            .allow(null, "")
            .messages({
                "array.base": "Nội dung học phải là mảng hoặc chuỗi",
            }),

        requirement: Joi.alternatives()
            .try(Joi.string(), Joi.array().items(Joi.string()))
            .allow(null, "")
            .messages({
                "array.base": "Yêu cầu phải là mảng hoặc chuỗi",
            }),

        level: Joi.string()
            .valid("beginner", "intermediate", "advanced")
            .allow(null, "")
            .messages({
                "any.only":
                    "Cấp độ phải là 'beginner', 'intermediate' hoặc 'advanced'",
            }),

        price: Joi.number().min(0).allow(null).messages({
            "number.base": "Giá phải là số",
            "number.min": "Giá không được nhỏ hơn 0",
        }),

        old_price: Joi.number().min(0).allow(null).messages({
            "number.base": "Giá gốc phải là số",
            "number.min": "Giá gốc không được nhỏ hơn 0",
        }),

        is_pro: Joi.boolean().allow(null).messages({
            "boolean.base": "Trạng thái khóa học Pro phải là true/false",
        }),

        thumbnail: Joi.string().allow(null, "").messages({
            "string.base": "Thumbnail phải là chuỗi tên file hoặc URL",
        }),
    }),
};

module.exports = {
    createCourse,
    updateCourse,
};
