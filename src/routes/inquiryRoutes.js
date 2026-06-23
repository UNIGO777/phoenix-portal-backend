const router = require('express').Router();
const inquiryController = require('../controllers/inquiryController');
const { createInquiryRules, updateStatusRules } = require('../validators/inquiryValidator');
const validate = require('../middleware/validator');
const { authenticate, adminOnly, userOnly } = require('../middleware/auth');

// User submits inquiry
router.post('/', authenticate, userOnly, createInquiryRules, validate, inquiryController.createInquiry);

// Admin views & manages inquiries
router.get('/', authenticate, adminOnly, inquiryController.listInquiries);
router.patch('/:id/status', authenticate, adminOnly, updateStatusRules, validate, inquiryController.updateInquiryStatus);

module.exports = router;
