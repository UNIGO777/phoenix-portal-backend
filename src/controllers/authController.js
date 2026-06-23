const crypto = require('crypto');
const env = require('../config/env');
const Admin = require('../models/Admin');
const User = require('../models/User');
const {
  generateTokens,
  setTokenCookies,
  clearTokenCookies,
  verifyRefreshToken,
  handleFailedLogin,
  resetLoginAttempts,
} = require('../services/authService');
const { sendPasswordResetEmail } = require('../services/emailService');
const { AppError, generateResetToken } = require('../utils/helpers');

// ── Admin Auth ──

exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Skip brute force lock check in development
    if (env.nodeEnv !== 'development' && admin.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account locked due to too many failed attempts. Try again later.',
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      await handleFailedLogin(admin);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await resetLoginAttempts(admin);

    const tokens = generateTokens(admin._id, 'admin');
    setTokenCookies(res, tokens);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: admin.toJSON(),
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.adminForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    // Always return success to prevent email enumeration
    if (!admin) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }

    const resetToken = generateResetToken();
    admin.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    admin.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await admin.save();

    await sendPasswordResetEmail(email, resetToken, 'admin');

    res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  } catch (error) {
    next(error);
  }
};

exports.adminResetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const admin = await Admin.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    }).select('+password');

    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    admin.password = password;
    admin.resetToken = undefined;
    admin.resetTokenExpiry = undefined;
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

exports.adminChangePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.user.id).select('+password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.adminLogout = async (req, res) => {
  clearTokenCookies(res);
  res.json({ success: true, message: 'Logged out successfully' });
};

// ── User Auth ──

exports.userLogin = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated, contact administrator' });
    }

    // Skip brute force lock check in development
    if (env.nodeEnv !== 'development' && user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account locked due to too many failed attempts. Try again later.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await handleFailedLogin(user);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await resetLoginAttempts(user);

    const tokens = generateTokens(user._id, 'user');
    setTokenCookies(res, tokens, !!rememberMe);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.userForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, isActive: true });

    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }

    const resetToken = generateResetToken();
    user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(email, resetToken, 'user');

    res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  } catch (error) {
    next(error);
  }
};

exports.userResetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

exports.userChangePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.userLogout = async (req, res) => {
  clearTokenCookies(res);
  res.json({ success: true, message: 'Logged out successfully' });
};

// ── Refresh Token ──

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const decoded = verifyRefreshToken(token);
    const tokens = generateTokens(decoded.id, decoded.role);
    setTokenCookies(res, tokens);

    res.json({ success: true, data: { accessToken: tokens.accessToken } });
  } catch (error) {
    clearTokenCookies(res);
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};
