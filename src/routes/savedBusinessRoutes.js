const router = require('express').Router();
const savedBusinessController = require('../controllers/savedBusinessController');
const { authenticate, userOnly } = require('../middleware/auth');

// All saved business routes are user only
router.use(authenticate, userOnly);

router.get('/', savedBusinessController.listSaved);
router.post('/:businessId', savedBusinessController.saveBusiness);
router.delete('/:businessId', savedBusinessController.unsaveBusiness);

module.exports = router;
