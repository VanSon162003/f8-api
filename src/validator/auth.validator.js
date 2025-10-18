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
            notEmpty: {
                errorMessage: "This field cannot be empty.",
            },
            isEmail: {
                errorMessage: "Please enter a valid email address.",
            },
            normalizeEmail: true,
        },

        password: {
            notEmpty: {
                errorMessage: "This field cannot be empty.",
            },
            isLength: {
                options: { min: 8 },
                errorMessage: "Password must be at least 8 characters long.",
            },
        },
    }),

    handlerValidatorErrors,
];

exports.loginValidate = [
    checkSchema({
        email: {
            notEmpty: {
                errorMessage: "This field cannot be empty.",
            },
            isEmail: {
                errorMessage: "Please enter a valid email address.",
            },
            normalizeEmail: true,
        },

        password: {
            notEmpty: {
                errorMessage: "This field cannot be empty.",
            },
            isLength: {
                options: { min: 8 },
                errorMessage: "Password must be at least 8 characters long.",
            },
        },
    }),

    handlerValidatorErrors,
];

exports.changePasswordValidate = [
    checkSchema({
        oldPassword: {
            notEmpty: true,
            errorMessage: "Old password is required",
        },
        newPassword: {
            notEmpty: true,
            isLength: {
                options: { min: 8 },
                errorMessage: "New password must be at least 8 characters long",
            },
        },
    }),
    handlerValidatorErrors,
];
