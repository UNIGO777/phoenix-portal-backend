const multer = require('multer');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
  logger.error(err.message, { stack: err.stack, url: req.originalUrl, method: req.method });

  // Multer errors (file size, file count, file type)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ success: false, message: 'File is too large. Maximum allowed size is 10 MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ success: false, message: 'Too many files. Maximum allowed is 10.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  // Express body-parser payload too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'File is too large. Maximum allowed size is 10 MB.' });
  }

  // Custom multer file filter errors (thrown as plain Error)
  if (err.message && err.message.includes('not a supported image')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
