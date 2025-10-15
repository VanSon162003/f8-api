const { body, param, query, validationResult } = require('express-validator');
const response = require('@/utils/response');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));
    return response.error(res, 422, 'Validation failed', extractedErrors);
};

const validateCreateComment = [
    body('content')
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Content must be between 1 and 1000 characters')
        .trim(),
    body('commentable_type')
        .notEmpty()
        .withMessage('Commentable type is required')
        .isIn(['post', 'course', 'lesson'])
        .withMessage('Invalid commentable type'),
    body('commentable_id')
        .isInt({ min: 1 })
        .withMessage('Commentable ID must be a positive integer'),
    body('parent_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Parent ID must be a positive integer'),
    validate,
];

const validateUpdateComment = [
    body('content')
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Content must be between 1 and 1000 characters')
        .trim(),
    validate,
];

const validateGetComments = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be an integer between 1 and 50'),
    validate,
];

const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID must be a positive integer'),
    validate,
];

const validatePostId = [
    param('postId')
        .isInt({ min: 1 })
        .withMessage('Post ID must be a positive integer'),
    validate,
];

module.exports = {
    validateCreateComment,
    validateUpdateComment,
    validateGetComments,
    validateId,
    validatePostId,
};
