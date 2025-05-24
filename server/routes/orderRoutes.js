const express = require('express');
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  updatePaymentStatus
} = require('../controllers/orderController');

const { protect, authorize } = require('../middlewares/auth');
const { validate, validationSets } = require('../utils/validation');
const { cacheConfigs } = require('../utils/cache');

const router = express.Router();

// All order routes require authentication
router.use(protect);

// Admin routes
router.get('/', authorize('admin'), cacheConfigs.short, getOrders);
router.put('/:id/status', 
  authorize('admin'), 
  validate(validationSets.updateOrderStatus), 
  updateOrderStatus
);

// User routes
router.post('/', validate(validationSets.createOrder), createOrder);
router.get('/myorders', cacheConfigs.profile, getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/payment', updatePaymentStatus);

module.exports = router;
