const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const path = require('path');

const env = require('./src/config/env');
const { helmetConfig } = require('./src/config/security');
const corsOptions = require('./src/config/cors');
const { connectDB } = require('./src/config/database');
const { generalLimiter } = require('./src/middleware/rateLimiter');
const { noIndex, noCache } = require('./src/middleware/security');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');

const app = express();

// Security middleware
app.use(helmet(helmetConfig));
app.use(cors(corsOptions));
app.use(hpp());
app.use(noIndex);
app.use(noCache);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Rate limiting
app.use('/api/', generalLimiter);

// Static files (uploaded images — behind auth in production)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Phoenix API is running', timestamp: new Date().toISOString() });
});

// ── Routes ──
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/profile', require('./src/routes/profileRoutes'));
app.use('/api/admin/profile', require('./src/routes/adminProfileRoutes'));
app.use('/api/industries', require('./src/routes/industryRoutes'));
app.use('/api/countries', require('./src/routes/countryRoutes'));
app.use('/api/businesses', require('./src/routes/businessRoutes'));
app.use('/api/inquiries', require('./src/routes/inquiryRoutes'));
app.use('/api/saved', require('./src/routes/savedBusinessRoutes'));
app.use('/api/bulk', require('./src/routes/bulkRoutes'));
app.use('/api/featured', require('./src/routes/featuredRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Start server
const start = async () => {
  await connectDB();

  app.listen(env.port, () => {
    logger.info(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
  });
};

start();

module.exports = app;
