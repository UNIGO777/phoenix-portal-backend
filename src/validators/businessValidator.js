const { body } = require('express-validator');

const createBusinessRules = [
  body('name').trim().notEmpty().withMessage('Business name is required'),
  body('industry').isMongoId().withMessage('Valid industry ID is required'),
  body('country').isMongoId().withMessage('Valid country ID is required'),
  body('description').optional().trim(),
  body('city').optional().trim(),
  body('askingPrice').optional().isFloat({ min: 0 }).withMessage('Asking price must be a positive number'),
  body('yearEstablished').optional().isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Invalid year'),
  body('numEmployees').optional().isInt({ min: 0 }).withMessage('Number of employees must be positive'),
  body('status').optional().isIn(['active', 'sold', 'draft']).withMessage('Status must be active, sold, or draft'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
];

const updateBusinessRules = [
  body('name').optional().trim().notEmpty().withMessage('Business name cannot be empty'),
  body('industry').optional().isMongoId().withMessage('Valid industry ID is required'),
  body('country').optional().isMongoId().withMessage('Valid country ID is required'),
  body('description').optional().trim(),
  body('city').optional().trim(),
  body('askingPrice').optional().isFloat({ min: 0 }).withMessage('Asking price must be a positive number'),
  body('yearEstablished').optional().isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Invalid year'),
  body('numEmployees').optional().isInt({ min: 0 }).withMessage('Number of employees must be positive'),
  body('status').optional().isIn(['active', 'sold', 'draft']).withMessage('Status must be active, sold, or draft'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
];

module.exports = { createBusinessRules, updateBusinessRules };
