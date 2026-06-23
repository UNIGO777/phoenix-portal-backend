const router = require('express').Router();
const { body } = require('express-validator');
const countryController = require('../controllers/countryController');
const validate = require('../middleware/validator');
const { authenticate, adminOnly } = require('../middleware/auth');

const createRules = [
  body('name').trim().notEmpty().withMessage('Country name is required'),
  body('code').optional().trim().isLength({ min: 2, max: 3 }).withMessage('Code must be 2-3 characters'),
];
const updateRules = [
  body('name').optional().trim().notEmpty().withMessage('Country name cannot be empty'),
  body('code').optional().trim().isLength({ min: 2, max: 3 }).withMessage('Code must be 2-3 characters'),
];

// List — any authenticated user
router.get('/', authenticate, countryController.listCountries);

// CUD — admin only
router.post('/', authenticate, adminOnly, createRules, validate, countryController.createCountry);
router.put('/:id', authenticate, adminOnly, updateRules, validate, countryController.updateCountry);
router.delete('/:id', authenticate, adminOnly, countryController.deleteCountry);

module.exports = router;
