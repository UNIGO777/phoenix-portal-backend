const router = require('express').Router();
const userController = require('../controllers/userController');
const { createUserRules, updateUserRules } = require('../validators/userValidator');
const validate = require('../middleware/validator');
const { authenticate, adminOnly } = require('../middleware/auth');

// All user management routes require admin auth
router.use(authenticate, adminOnly);

router.get('/', userController.listUsers);
router.get('/:id', userController.getUser);
router.post('/', createUserRules, validate, userController.createUser);
router.put('/:id', updateUserRules, validate, userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/activate', userController.activateUser);
router.patch('/:id/deactivate', userController.deactivateUser);
router.post('/:id/reset-password', userController.resetPassword);

module.exports = router;
