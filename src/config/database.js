const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.db.uri, {
      dbName: env.db.name,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Database connection failed:', error.message);
    if (env.nodeEnv === 'production') {
      process.exit(1);
    }
    logger.warn('Server will start without database — configure MongoDB and restart');
  }
};

module.exports = { connectDB };
