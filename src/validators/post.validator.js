const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Create post validation
const validateCreatePost = [
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 1, max: 255 })
        .withMessage('Title must be between 1 and 255 characters')
        .trim(),
    
    body('content')
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ min: 10 })
        .withMessage('Content must be at least 10 characters long')
        .trim(),
    
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters')
        .trim(),
    
    body('thumbnail')
        .optional()
        .isURL()
        .withMessage('Thumbnail must be a valid URL')
        .isLength({ max: 500 })
        .withMessage('Thumbnail URL must not exceed 500 characters'),
    
    body('status')
        .optional()
        .isIn(['draft', 'published', 'archived'])
        .withMessage('Status must be one of: draft, published, archived'),
    
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array')
        .custom((tags) => {
            if (tags && tags.length > 0) {
                for (const tag of tags) {
                    if (typeof tag !== 'string' || tag.trim().length === 0) {
                        throw new Error('Each tag must be a non-empty string');
                    }
                    if (tag.length > 100) {
                        throw new Error('Each tag must not exceed 100 characters');
                    }
                }
            }
            return true;
        }),
    
    handleValidationErrors
];

// Update post validation
const validateUpdatePost = [
    body('title')
        .optional()
        .isLength({ min: 1, max: 255 })
        .withMessage('Title must be between 1 and 255 characters')
        .trim(),
    
    body('content')
        .optional()
        .isLength({ min: 10 })
        .withMessage('Content must be at least 10 characters long')
        .trim(),
    
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters')
        .trim(),
    
    body('thumbnail')
        .optional()
        .isURL()
        .withMessage('Thumbnail must be a valid URL')
        .isLength({ max: 500 })
        .withMessage('Thumbnail URL must not exceed 500 characters'),
    
    body('status')
        .optional()
        .isIn(['draft', 'published', 'archived'])
        .withMessage('Status must be one of: draft, published, archived'),
    
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array')
        .custom((tags) => {
            if (tags && tags.length > 0) {
                for (const tag of tags) {
                    if (typeof tag !== 'string' || tag.trim().length === 0) {
                        throw new Error('Each tag must be a non-empty string');
                    }
                    if (tag.length > 100) {
                        throw new Error('Each tag must not exceed 100 characters');
                    }
                }
            }
            return true;
        }),
    
    handleValidationErrors
];

// Get posts validation
const validateGetPosts = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    
    query('status')
        .optional()
        .isIn(['draft', 'published', 'archived'])
        .withMessage('Status must be one of: draft, published, archived'),
    
    query('search')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Search term must not exceed 255 characters')
        .trim(),
    
    handleValidationErrors
];

// ID parameter validation
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID must be a positive integer'),
    
    handleValidationErrors
];

// Slug parameter validation
const validateSlug = [
    param('slug')
        .notEmpty()
        .withMessage('Slug is required')
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Slug must contain only lowercase letters, numbers, and hyphens')
        .isLength({ min: 1, max: 255 })
        .withMessage('Slug must be between 1 and 255 characters'),
    
    handleValidationErrors
];

// Tag slug validation
const validateTagSlug = [
    param('tagSlug')
        .notEmpty()
        .withMessage('Tag slug is required')
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Tag slug must contain only lowercase letters, numbers, and hyphens')
        .isLength({ min: 1, max: 100 })
        .withMessage('Tag slug must be between 1 and 100 characters'),
    
    handleValidationErrors
];

module.exports = {
    validateCreatePost,
    validateUpdatePost,
    validateGetPosts,
    validateId,
    validateSlug,
    validateTagSlug,
    handleValidationErrors
};
