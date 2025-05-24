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

const router = express.Router();

// All order routes require authentication
router.use(protect);

router.get('/', authorize('admin'), getOrders);
router.post('/', createOrder);

router.get('/myorders', getMyOrders);

router.get('/:id', getOrderById);

router.put('/:id/status', authorize('admin'), updateOrderStatus);

router.put('/:id/payment', updatePaymentStatus);

module.exports = router;
