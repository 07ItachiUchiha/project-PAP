const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCouponToCart,
  removeCouponFromCart,
  getAvailableCouponsForCart
} = require('../controllers/cartController');

const { protect } = require('../middlewares/auth');

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);           // Changed from '/add' to '/'
router.put('/', updateCartItem);       // Changed from '/update' to '/'
router.delete('/clear', clearCart);    // Keep as '/clear'
router.delete('/:productId', removeFromCart);  // Changed from '/remove/:productId' to '/:productId'

// Coupon routes
router.get('/available-coupons', getAvailableCouponsForCart);
router.post('/apply-coupon', applyCouponToCart);
router.delete('/remove-coupon/:couponId', removeCouponFromCart);

module.exports = router;
