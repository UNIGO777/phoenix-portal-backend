const router = require('express').Router();
const featuredController = require('../controllers/featuredController');
const { authenticate, adminOnly } = require('../middleware/auth');

router.get('/', authenticate, featuredController.listFeatured);
router.put('/order', authenticate, adminOnly, featuredController.updateOrder);

module.exports = router;
