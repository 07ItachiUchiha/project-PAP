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
const wishlistRoutes = require('./routes/wishlistRoutes');

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

// Custom static file middleware with CORS for image access
const serveStaticWithCORS = (directory) => {
  return [
    // CORS Headers middleware
    (req, res, next) => {
      // Completely disable security headers that might block cross-origin image loading
      res.removeHeader('Content-Security-Policy');
      res.removeHeader('Cross-Origin-Embedder-Policy');
      res.removeHeader('Cross-Origin-Resource-Policy');
      res.removeHeader('X-Content-Type-Options');
      
      // Set fully permissive CORS headers
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      // Explicitly set cross-origin resource policy header
      res.header('Cross-Origin-Resource-Policy', 'cross-origin');
      
      // For preflight requests
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      
      next();
    },
    // Static file serving with proper content type detection
    express.static(path.join(__dirname, directory), {
      setHeaders: (res, filePath) => {
        // Set cache control for better performance
        res.setHeader('Cache-Control', 'public, max-age=86400');
        // Ensure proper content type for images
        if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
          res.setHeader('Content-Type', 'image/jpeg');
        } else if (filePath.endsWith('.png')) {
          res.setHeader('Content-Type', 'image/png');
        } else if (filePath.endsWith('.webp')) {
          res.setHeader('Content-Type', 'image/webp');
        }
      }
    })
  ];
};

// Serve static files from uploads directory with CORS headers
app.use('/uploads', serveStaticWithCORS('uploads'));

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
app.use('/api/wishlist', wishlistRoutes);

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
