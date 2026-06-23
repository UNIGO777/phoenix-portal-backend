const nodemailer = require('nodemailer');
const env = require('./env');
const logger = require('../utils/logger');

let transporter;

if (env.smtp.host && env.smtp.user) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });

  transporter.verify((error) => {
    if (error) {
      logger.warn('SMTP connection failed:', error.message);
    } else {
      logger.info('SMTP server ready');
    }
  });
} else {
  logger.warn('SMTP not configured — email sending disabled');
}

module.exports = transporter;
