const { body, validationResult } = require('express-validator');

// Common validation rules
const validationRules = {
  // User validation
  name: body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  email: body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  password: body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  // Product validation
  productName: body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),

  description: body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),

  price: body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),

  category: body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),

  stock: body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  // Order validation
  shippingAddress: [
    body('shippingAddress.address')
      .trim()
      .notEmpty()
      .withMessage('Address is required')
      .isLength({ min: 5, max: 200 })
      .withMessage('Address must be between 5 and 200 characters'),

    body('shippingAddress.city')
      .trim()
      .notEmpty()
      .withMessage('City is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('City must be between 2 and 50 characters'),

    body('shippingAddress.state')
      .trim()
      .notEmpty()
      .withMessage('State is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('State must be between 2 and 50 characters'),

    body('shippingAddress.postalCode')
      .trim()
      .notEmpty()
      .withMessage('Postal code is required')
      .matches(/^[0-9]{6}$/)
      .withMessage('Postal code must be 6 digits'),

    body('shippingAddress.country')
      .trim()
      .notEmpty()
      .withMessage('Country is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Country must be between 2 and 50 characters')
  ],

  paymentMethod: body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['card', 'upi', 'netbanking', 'cod', 'wallet'])
    .withMessage('Invalid payment method'),

  // Cart validation
  cartItems: body('items')
    .isArray({ min: 1 })
    .withMessage('Cart must contain at least one item'),

  cartItem: [
    body('items.*.product')
      .notEmpty()
      .withMessage('Product ID is required')
      .isMongoId()
      .withMessage('Invalid product ID'),

    body('items.*.quantity')
      .notEmpty()
      .withMessage('Quantity is required')
      .isInt({ min: 1, max: 100 })
      .withMessage('Quantity must be between 1 and 100')
  ],

  // Review validation
  rating: body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  comment: body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must be less than 500 characters'),

  // Search validation
  searchQuery: body('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .escape(),

  // Phone validation
  phone: body('phone')
    .optional()
    .matches(/^[\+]?[0-9\-\(\)\s]+$/)
    .withMessage('Please provide a valid phone number')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters')
};

// Validation rule sets for different endpoints
const validationSets = {
  // Auth validations
  register: [
    validationRules.name,
    validationRules.email,
    validationRules.password,
    body('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage('Invalid role')
  ],

  login: [
    validationRules.email,
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  forgotPassword: [
    validationRules.email
  ],

  resetPassword: [
    validationRules.password,
    body('resetToken')
      .notEmpty()
      .withMessage('Reset token is required')
  ],

  // Product validations
  createProduct: [
    validationRules.productName,
    validationRules.description,
    validationRules.price,
    validationRules.category,
    validationRules.stock,
    body('careInstructions')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Care instructions must be less than 500 characters'),
    body('plantType')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Plant type must be less than 50 characters')
  ],

  updateProduct: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Product name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Price must be a positive number'),
    body('category')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Category must be between 2 and 50 characters'),
    body('stock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Stock must be a non-negative integer')
  ],

  // Order validations
  createOrder: [
    ...validationRules.shippingAddress,
    validationRules.paymentMethod,
    body('orderItems')
      .isArray({ min: 1 })
      .withMessage('Order must contain at least one item'),
    body('orderItems.*.product')
      .notEmpty()
      .withMessage('Product ID is required')
      .isMongoId()
      .withMessage('Invalid product ID'),
    body('orderItems.*.quantity')
      .notEmpty()
      .withMessage('Quantity is required')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    body('itemsPrice')
      .notEmpty()
      .withMessage('Items price is required')
      .isFloat({ min: 0 })
      .withMessage('Items price must be a positive number'),
    body('totalPrice')
      .notEmpty()
      .withMessage('Total price is required')
      .isFloat({ min: 0 })
      .withMessage('Total price must be a positive number')
  ],

  updateOrderStatus: [
    body('orderStatus')
      .notEmpty()
      .withMessage('Order status is required')
      .isIn(['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid order status'),
    body('trackingNumber')
      .optional()
      .trim()
      .isLength({ min: 5, max: 50 })
      .withMessage('Tracking number must be between 5 and 50 characters')
  ],

  // Cart validations
  addToCart: [
    body('product')
      .notEmpty()
      .withMessage('Product ID is required')
      .isMongoId()
      .withMessage('Invalid product ID'),
    body('quantity')
      .notEmpty()
      .withMessage('Quantity is required')
      .isInt({ min: 1, max: 100 })
      .withMessage('Quantity must be between 1 and 100')
  ],

  updateCartItem: [
    body('quantity')
      .notEmpty()
      .withMessage('Quantity is required')
      .isInt({ min: 1, max: 100 })
      .withMessage('Quantity must be between 1 and 100')
  ],

  // User profile validations
  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    validationRules.phone
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    validationRules.password
  ]
};

// Validation middleware
const validate = (validationSet) => {
  return async (req, res, next) => {
    // Run validations
    await Promise.all(validationSet.map(validation => validation.run(req)));

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }

    next();
  };
};

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    return str
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  };

  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
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

module.exports = {
  validationRules,
  validationSets,
  validate,
  sanitizeInput
};
