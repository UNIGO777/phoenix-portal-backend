const User = require('../models/User');
const { generateTempPassword } = require('../utils/helpers');
const { sendNewUserEmail } = require('./emailService');

const createUser = async (userData) => {
  const password = userData.password || generateTempPassword();
  const user = await User.create({ ...userData, password });

  // Send welcome email with password and name
  await sendNewUserEmail(user.email, password, user.fullName);

  return user;
};

const resetUserPassword = async (userId) => {
  const user = await User.findById(userId).select('+password');
  if (!user) return null;

  const tempPassword = generateTempPassword();
  user.password = tempPassword;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  await sendNewUserEmail(user.email, tempPassword, user.fullName);

  return user;
};

module.exports = { createUser, resetUserPassword };
