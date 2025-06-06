const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSalesAnalytics,
  getProductAnalytics
} = require('../controllers/adminController');

// Import product controller for admin product management
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// Import order controller for admin order management
const {
  getOrders,
  updateOrderStatus
} = require('../controllers/orderController');

// Import coupon controller for admin coupon management
const {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponStats,
  bulkOperations
} = require('../controllers/couponController');

const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);

// Product Management (Admin version)
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Order Management (Admin version)
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Coupon Management (Admin version)
router.get('/coupons', getAllCoupons);
router.post('/coupons', createCoupon);
router.get('/coupons/:id', getCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);
router.get('/coupons/:id/stats', getCouponStats);
router.post('/coupons/bulk', bulkOperations);

// Analytics
router.get('/analytics/sales', getSalesAnalytics);
router.get('/analytics/products', getProductAnalytics);

module.exports = router;
