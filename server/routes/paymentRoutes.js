const express = require('express');
const {
  createRazorpayOrder,
  verifyPayment,
  handleRazorpayWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Protected routes
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyPayment);

// Special route for Razorpay webhook
router.post('/webhook', express.json(), handleRazorpayWebhook);

module.exports = router;
