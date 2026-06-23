const jwt = require('jsonwebtoken');
const env = require('../config/env');

// In development, disable brute force protection; in production, enforce limits
const MAX_LOGIN_ATTEMPTS = env.nodeEnv === 'development' ? 9999 : 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes (only used in production)

const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiry });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiry });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwt.accessSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.jwt.refreshSecret);
};

const generateTokens = (id, role) => {
  const payload = { id, role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

const setTokenCookies = (res, tokens, rememberMe = false) => {
  const isProduction = env.nodeEnv === 'production';
  const refreshMaxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000  // 30 days
    : 7 * 24 * 60 * 60 * 1000;  // 7 days

  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 min
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: refreshMaxAge,
    path: '/api/auth',
  });
};

const clearTokenCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth' });
};

const handleFailedLogin = async (account) => {
  // Skip brute force protection in development mode
  if (env.nodeEnv === 'development') {
    return;
  }

  account.loginAttempts += 1;
  if (account.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
    account.lockUntil = new Date(Date.now() + LOCK_TIME);
  }
  await account.save();
};

const resetLoginAttempts = async (account) => {
  if (account.loginAttempts > 0 || account.lockUntil) {
    account.loginAttempts = 0;
    account.lockUntil = undefined;
    await account.save();
  }
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
  handleFailedLogin,
  resetLoginAttempts,
  MAX_LOGIN_ATTEMPTS,
  LOCK_TIME,
};
