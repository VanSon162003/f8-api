const { checkSchema } = require("express-validator");
const handlerValidatorErrors = require("./handlerValidatorErrors");

exports.registerValidate = [
    checkSchema({
        frist_name: {
            notEmpty: true,
            errorMessage: "This field cannot be empty.",
        },

        last_name: {
            notEmpty: true,
            errorMessage: "This field cannot be empty.",
        },
        email: {
            notEmpty: true,
            errorMessage: "This field cannot be empty.",
        },
        password: {
            notEmpty: true,
            errorMessage: "This field cannot be empty.",
        },
    }),

    handlerValidatorErrors,
];

exports.updateCategoryValidator = [
    checkSchema({
        name: {
            optional: true,
            notEmpty: true,
            errorMessage: "trường này không được để trống",
        },

        desc: {
            optional: true,
            notEmpty: true,
            errorMessage: "trường này không được để trống",
        },
    }),

    handlerValidatorErrors,
];
