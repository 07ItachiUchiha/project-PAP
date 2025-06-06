const express = require('express');
const { body } = require('express-validator');
const {
  createReturnRequest,
  getUserReturns,
  getReturnById,
  updateReturnRequest,
  cancelReturnRequest,
  checkReturnEligibility,
  getAdminReturns,
  updateReturnStatus,
  processInspection,
  getReturnAnalytics
} = require('../controllers/returnController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// ===== VALIDATION MIDDLEWARE =====

// Admin validation middleware
const validateAdminStatusUpdate = [
  body('status')
    .isIn(['requested', 'approved', 'rejected', 'pickup_scheduled', 'picked_up', 'received', 'inspected', 'processed', 'completed', 'cancelled'])
    .withMessage('Invalid return status'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('refundAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Refund amount must be a positive number'),
  body('processingFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Processing fee must be a positive number'),
  body('shippingRefund')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping refund must be a positive number')
];

const validateInspection = [
  body('status')
    .isIn(['pending', 'passed', 'failed', 'partial'])
    .withMessage('Invalid inspection status'),
  body('notes')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Inspection notes must be between 10 and 1000 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*.url')
    .optional()
    .isURL()
    .withMessage('Invalid image URL'),
  body('images.*.publicId')
    .optional()
    .isString()
    .withMessage('Image public ID must be a string')
];

// Validation middleware for return creation
const validateReturnCreation = [
  body('orderId')
    .isMongoId()
    .withMessage('Valid order ID is required'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item must be specified for return'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Valid product ID is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.reason')
    .optional()
    .isIn(['damaged', 'defective', 'wrong_item', 'size_issue', 'quality_issue', 'not_as_described', 'changed_mind', 'duplicate_order', 'other'])
    .withMessage('Invalid return reason'),
  body('primaryReason')
    .isIn(['damaged', 'defective', 'wrong_item', 'size_issue', 'quality_issue', 'not_as_described', 'changed_mind', 'duplicate_order', 'other'])
    .withMessage('Valid primary return reason is required'),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('returnType')
    .optional()
    .isIn(['refund', 'exchange', 'store_credit'])
    .withMessage('Invalid return type'),
  body('pickupAddress.street')
    .optional()
    .isLength({ min: 5 })
    .withMessage('Street address must be at least 5 characters'),
  body('pickupAddress.city')
    .optional()
    .isLength({ min: 2 })
    .withMessage('City must be at least 2 characters'),
  body('pickupAddress.postalCode')
    .optional()
    .matches(/^[A-Za-z0-9\s-]{3,10}$/)
    .withMessage('Invalid postal code format'),
  body('customerNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Customer notes cannot exceed 500 characters')
];

// Validation middleware for return updates
const validateReturnUpdate = [
  body('description')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('customerNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Customer notes cannot exceed 500 characters'),
  body('pickupAddress.street')
    .optional()
    .isLength({ min: 5 })
    .withMessage('Street address must be at least 5 characters'),
  body('pickupAddress.city')
    .optional()
    .isLength({ min: 2 })
    .withMessage('City must be at least 2 characters'),
  body('pickupAddress.postalCode')
    .optional()
    .matches(/^[A-Za-z0-9\s-]{3,10}$/)
    .withMessage('Invalid postal code format')
];

// Apply authentication to all routes
router.use(protect);

// ===== ADMIN ROUTES (must come BEFORE /:id route) =====
// Admin routes with specific paths to avoid conflicts
router.get('/admin', authorize('admin'), getAdminReturns);
router.get('/admin/analytics', authorize('admin'), getReturnAnalytics);
router.put('/admin/:id/status', authorize('admin'), validateAdminStatusUpdate, updateReturnStatus);
router.put('/admin/:id/inspection', authorize('admin'), validateInspection, processInspection);

// ===== CUSTOMER ROUTES =====
router.post('/', validateReturnCreation, createReturnRequest);
router.get('/my-returns', getUserReturns);
router.get('/check-eligibility/:orderId', checkReturnEligibility);
// Make sure this comes after all specific routes
router.get('/:id', getReturnById);
router.put('/:id', validateReturnUpdate, updateReturnRequest);
router.delete('/:id', cancelReturnRequest);

module.exports = router;
