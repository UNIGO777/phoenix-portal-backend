const { body } = require('express-validator');

const createUserRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('mobile').optional().trim(),
  body('country').optional().isMongoId().withMessage('Invalid country ID'),
  body('passportNumber').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

const updateUserRules = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('mobile').optional().trim(),
  body('country').optional().isMongoId().withMessage('Invalid country ID'),
  body('passportNumber').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

module.exports = { createUserRules, updateUserRules };
