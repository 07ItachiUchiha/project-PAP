const express = require('express');
const {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
  getAvailableCoupons,
  getCouponStats,
  bulkOperations
} = require('../controllers/couponController');

const { protect, authorize } = require('../middlewares/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules for coupon creation/update
const couponValidationRules = [
  body('code')
    .isLength({ min: 3, max: 20 })
    .withMessage('Coupon code must be between 3 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Coupon code can only contain uppercase letters and numbers'),
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Coupon name must be between 1 and 100 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),
  body('type')
    .isIn(['percentage', 'fixed', 'free_shipping', 'buy_x_get_y'])
    .withMessage('Invalid coupon type'),
  body('value')
    .isFloat({ min: 0 })
    .withMessage('Coupon value must be a positive number'),
  body('maxDiscount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount must be a positive number'),
  body('minOrderValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order value must be a positive number'),
  body('usageLimit.total')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total usage limit must be at least 1'),
  body('usageLimit.perUser')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Per user limit must be at least 1'),
  body('validFrom')
    .isISO8601()
    .withMessage('Valid from date must be a valid date'),
  body('validTo')
    .isISO8601()
    .withMessage('Valid to date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.validFrom)) {
        throw new Error('Valid to date must be after valid from date');
      }
      return true;
    }),
  body('applicableProducts.type')
    .optional()
    .isIn(['all', 'specific', 'category', 'exclude'])
    .withMessage('Invalid applicable products type'),
  body('applicableProducts.categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
  body('applicableProducts.categories.*')
    .optional()
    .isIn(['plants', 'tools', 'organic-supplies', 'organic-vegetables', 'gifts', 'accessories'])
    .withMessage('Invalid category'),
  body('buyXGetY.buyQuantity')
    .if(body('type').equals('buy_x_get_y'))
    .isInt({ min: 1 })
    .withMessage('Buy quantity must be at least 1'),
  body('buyXGetY.getQuantity')
    .if(body('type').equals('buy_x_get_y'))
    .isInt({ min: 1 })
    .withMessage('Get quantity must be at least 1'),
  body('buyXGetY.maxSets')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max sets must be at least 1'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('isAutomatic')
    .optional()
    .isBoolean()
    .withMessage('isAutomatic must be a boolean'),
  body('stackable')
    .optional()
    .isBoolean()
    .withMessage('stackable must be a boolean'),
  body('firstTimeOnly')
    .optional()
    .isBoolean()
    .withMessage('firstTimeOnly must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('internalNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Internal notes cannot exceed 1000 characters')
    .trim()
];

// Validation for coupon code validation
const validateCouponRules = [
  body('code')
    .isLength({ min: 1 })
    .withMessage('Coupon code is required')
    .trim(),
  body('cartItems')
    .optional()
    .isArray()
    .withMessage('Cart items must be an array'),
  body('cartItems.*.product')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('cartItems.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID')
];

// Validation for bulk operations
const bulkOperationRules = [
  body('operation')
    .isIn(['activate', 'deactivate', 'delete', 'updateExpiry'])
    .withMessage('Invalid operation'),
  body('couponIds')
    .isArray({ min: 1 })
    .withMessage('At least one coupon ID is required'),
  body('couponIds.*')
    .isMongoId()
    .withMessage('Invalid coupon ID'),
  body('data.validTo')
    .if(body('operation').equals('updateExpiry'))
    .isISO8601()
    .withMessage('Valid expiry date is required for update expiry operation')
];

// Public routes (for coupon validation during checkout)
router.post('/validate', validateCouponRules, handleValidationErrors, validateCoupon);

// Protected routes (require authentication)
router.use(protect);

// User routes
router.get('/available', getAvailableCoupons);
router.post('/apply', applyCoupon);

// Admin routes
router.use(authorize('admin', 'super-admin'));

router
  .route('/')
  .get(getAllCoupons)
  .post(couponValidationRules, handleValidationErrors, createCoupon);

router.post('/bulk', bulkOperationRules, handleValidationErrors, bulkOperations);

router
  .route('/:id')
  .get(param('id').isMongoId().withMessage('Invalid coupon ID'), handleValidationErrors, getCoupon)
  .put(
    param('id').isMongoId().withMessage('Invalid coupon ID'),
    couponValidationRules,
    handleValidationErrors,
    updateCoupon
  )
  .delete(param('id').isMongoId().withMessage('Invalid coupon ID'), handleValidationErrors, deleteCoupon);

router.get(
  '/:id/stats',
  param('id').isMongoId().withMessage('Invalid coupon ID'),
  handleValidationErrors,
  getCouponStats
);

module.exports = router;
