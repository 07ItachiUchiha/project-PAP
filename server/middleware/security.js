const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "http://localhost:5000", "http://localhost:5173", "http://localhost:5174", "*"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com", "https://checkout.razorpay.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://api.razorpay.com", "http://localhost:5000", "http://localhost:5173", "http://localhost:5174"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com", "https://api.razorpay.com", "https://checkout.razorpay.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      error: 'Too many requests'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
        error: 'Too many requests',
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
const rateLimits = {
  // General API rate limit
  general: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per window
    'Too many requests from this IP, please try again later'
  ),

  // Authentication rate limit (stricter)
  auth: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 login attempts per window
    'Too many login attempts, please try again later'
  ),

  // Password reset rate limit
  passwordReset: createRateLimit(
    60 * 60 * 1000, // 1 hour
    3, // 3 password reset attempts per hour
    'Too many password reset attempts, please try again later'
  ),

  // Upload rate limit
  upload: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    10, // 10 uploads per window
    'Too many upload attempts, please try again later'
  ),

  // Search rate limit
  search: createRateLimit(
    1 * 60 * 1000, // 1 minute
    30, // 30 searches per minute
    'Too many search requests, please slow down'
  ),

  // Order creation rate limit
  orders: createRateLimit(
    60 * 60 * 1000, // 1 hour
    10, // 10 orders per hour
    'Too many order attempts, please try again later'
  )
};

// Data sanitization middleware
const sanitizeData = [
  // Prevent NoSQL injection attacks
  mongoSanitize(),
  
  // Prevent XSS attacks
  xss(),
  
  // Prevent HTTP Parameter Pollution
  hpp({
    whitelist: [
      'sort',
      'fields',
      'page',
      'limit',
      'category',
      'price',
      'rating'
    ]
  })
];

// Input validation middleware
const validateInput = (req, res, next) => {
  // Remove any potential script tags from all string inputs
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove script tags and potentially dangerous content
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

// File upload security middleware
const validateFileUpload = (req, res, next) => {
  if (req.file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed'
      });
    }

    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }
  }

  next();
};

// CORS security options
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5173',  // Added localhost equivalent
      'http://127.0.0.1:3000'   // Added localhost equivalent
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // For development environments, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
};

// Error handling middleware for security-related errors
const securityErrorHandler = (err, req, res, next) => {
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      error: 'Request blocked by CORS policy'
    });
  }

  // Handle other security-related errors
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large',
      error: 'Payload exceeds maximum size limit'
    });
  }

  // Handle malformed JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format',
      error: 'Request body contains invalid JSON'
    });
  }

  next(err);
};

module.exports = {
  securityHeaders,
  rateLimits,
  sanitizeData,
  validateInput,
  validateFileUpload,
  corsOptions,
  securityErrorHandler
};
