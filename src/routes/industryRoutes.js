const router = require('express').Router();
const { body } = require('express-validator');
const industryController = require('../controllers/industryController');
const validate = require('../middleware/validator');
const { authenticate, adminOnly } = require('../middleware/auth');
const { uploadBusinessImages } = require('../middleware/upload');

const nameRule = [body('name').trim().notEmpty().withMessage('Industry name is required')];

// List — any authenticated user
router.get('/', authenticate, industryController.listIndustries);

// CUD — admin only (single image upload via 'image' field)
router.post('/', authenticate, adminOnly, uploadBusinessImages.single('image'), nameRule, validate, industryController.createIndustry);
router.put('/:id', authenticate, adminOnly, uploadBusinessImages.single('image'), nameRule, validate, industryController.updateIndustry);
router.delete('/:id', authenticate, adminOnly, industryController.deleteIndustry);

module.exports = router;
