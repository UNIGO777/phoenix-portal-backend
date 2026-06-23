const { verifyAccessToken, verifyRefreshToken, generateTokens, setTokenCookies } = require('../services/authService');
const Admin = require('../models/Admin');
const User = require('../models/User');
const { AppError } = require('../utils/helpers');

const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies.accessToken;

    // Also accept Bearer token from Authorization header
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      // If access token expired, try to refresh silently
      if (err.name === 'TokenExpiredError') {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
          throw new AppError('Session expired, please login again', 401);
        }

        const refreshDecoded = verifyRefreshToken(refreshToken);
        const tokens = generateTokens(refreshDecoded.id, refreshDecoded.role);
        setTokenCookies(res, tokens);
        decoded = { id: refreshDecoded.id, role: refreshDecoded.role };
      } else {
        throw new AppError('Invalid token', 401);
      }
    }

    // Load the account
    let account;
    if (decoded.role === 'admin') {
      account = await Admin.findById(decoded.id);
    } else {
      account = await User.findById(decoded.id);
      if (account && !account.isActive) {
        throw new AppError('Account deactivated, contact administrator', 403);
      }
    }

    if (!account) {
      throw new AppError('Account not found', 401);
    }

    req.user = { id: account._id, role: decoded.role, account };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

const userOnly = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ success: false, message: 'User access required' });
  }
  next();
};

module.exports = { authenticate, adminOnly, userOnly };
