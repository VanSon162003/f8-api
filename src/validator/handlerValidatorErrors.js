const { validationResult } = require("express-validator");

const handlerValidatorErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const formattedErrors = errors
        .array({
            onlyFirstError: true,
        })
        .map((err) => ({
            field: err.path,
            message: err.msg,
        }));
    return res.status(422).json({
        errors: formattedErrors,
    });
};

module.exports = handlerValidatorErrors;
