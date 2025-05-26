const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const searchRoutes = require('./routes/searchRoutes');

// Import middleware
const errorHandler = require('./middlewares/errorHandler');
const { securityHeaders, rateLimits, sanitizeData, validateInput, corsOptions, securityErrorHandler } = require('./middleware/security');

// Import utilities
const { connectRedis, cacheConfigs } = require('./utils/cache');

const app = express();

// Initialize Redis connection
connectRedis().catch(err => {
  console.error('Failed to connect to Redis:', err);
});

// Enhanced security middleware
app.use(securityHeaders);

// Data sanitization middleware
app.use(sanitizeData);

// Input validation middleware
app.use(validateInput);

// Rate limiting with different configs for different endpoints
app.use('/api/auth/login', rateLimits.auth);
app.use('/api/auth/forgot-password', rateLimits.passwordReset);
app.use('/api/upload', rateLimits.upload);
app.use('/api/search', rateLimits.search);
app.use('/api/orders', rateLimits.orders);
app.use('/api/', rateLimits.general);

// Enhanced CORS configuration
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PlantPAP API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Special route for Stripe webhook - needs raw body
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// API Routes with caching where appropriate
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/search', searchRoutes);

// Handle undefined routes
app.all('*', (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

// Security error handling middleware
app.use(securityErrorHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
