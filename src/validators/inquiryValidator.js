const { body } = require('express-validator');

const createInquiryRules = [
  body('business').isMongoId().withMessage('Valid business ID is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
    .isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters'),
];

const updateStatusRules = [
  body('status')
    .isIn(['new', 'in_progress', 'responded', 'closed'])
    .withMessage('Status must be new, in_progress, responded, or closed'),
];

module.exports = { createInquiryRules, updateStatusRules };
