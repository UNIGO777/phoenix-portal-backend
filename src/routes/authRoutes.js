const router = require('express').Router();
const authController = require('../controllers/authController');
const { loginRules, forgotPasswordRules, resetPasswordRules, changePasswordRules } = require('../validators/authValidator');
const validate = require('../middleware/validator');
const { authenticate, adminOnly, userOnly } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// ── Admin Auth ──
router.post('/admin/login', authLimiter, loginRules, validate, authController.adminLogin);
router.post('/admin/forgot-password', authLimiter, forgotPasswordRules, validate, authController.adminForgotPassword);
router.post('/admin/reset-password', resetPasswordRules, validate, authController.adminResetPassword);
router.post('/admin/change-password', authenticate, adminOnly, changePasswordRules, validate, authController.adminChangePassword);
router.post('/admin/logout', authenticate, adminOnly, authController.adminLogout);

// ── Admin OTP ──
router.post('/admin/verify-otp', authLimiter, authController.adminVerifyOtp);

// ── User Auth ──
router.post('/user/login', authLimiter, loginRules, validate, authController.userLogin);
router.post('/user/forgot-password', authLimiter, forgotPasswordRules, validate, authController.userForgotPassword);
router.post('/user/reset-password', resetPasswordRules, validate, authController.userResetPassword);
router.post('/user/change-password', authenticate, userOnly, changePasswordRules, validate, authController.userChangePassword);
router.post('/user/logout', authenticate, userOnly, authController.userLogout);

// ── User OTP ──
router.post('/user/verify-otp', authLimiter, authController.userVerifyOtp);

// ── Refresh ──
router.post('/refresh', authController.refreshToken);

module.exports = router;
