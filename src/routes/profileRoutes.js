const router = require('express').Router();
const profileController = require('../controllers/profileController');
const { authenticate, userOnly } = require('../middleware/auth');

router.use(authenticate, userOnly);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

module.exports = router;
