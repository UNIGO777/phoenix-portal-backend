const router = require('express').Router();
const businessController = require('../controllers/businessController');
const { createBusinessRules, updateBusinessRules } = require('../validators/businessValidator');
const validate = require('../middleware/validator');
const { authenticate, adminOnly } = require('../middleware/auth');
const { uploadBusinessImages } = require('../middleware/upload');

// All business routes require authentication
router.use(authenticate);

// Search suggestions
router.get('/suggestions', businessController.searchSuggestions);

// List & get — any authenticated user
router.get('/', businessController.listBusinesses);
router.get('/:id', businessController.getBusiness);

// CUD — admin only
router.post('/', adminOnly, createBusinessRules, validate, businessController.createBusiness);
router.put('/:id', adminOnly, updateBusinessRules, validate, businessController.updateBusiness);
router.delete('/:id', adminOnly, businessController.deleteBusiness);
router.patch('/:id/status', adminOnly, businessController.changeStatus);
router.patch('/:id/featured', adminOnly, businessController.toggleFeatured);
router.post('/:id/images', adminOnly, uploadBusinessImages.array('images', 10), businessController.uploadImages);
router.delete('/:id/images/:imageIndex', adminOnly, businessController.removeImage);

module.exports = router;
