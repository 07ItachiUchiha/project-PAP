const express = require('express');
const {
  createPaymentIntent,
  completePayment,
  handleStripeWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Protected routes
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/complete-payment', protect, completePayment);

// Special route for Stripe webhook
// This needs raw body for Stripe signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
