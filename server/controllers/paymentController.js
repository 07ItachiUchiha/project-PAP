const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

/**
 * @desc    Create payment intent for Stripe
 * @route   POST /api/payment/create-payment-intent
 * @access  Private
 */
const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'inr', orderId } = req.body;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Find order to make sure it exists and belongs to the user
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this order'
      });
    }

    // If order is already paid, return error
    if (order.paymentInfo && order.paymentInfo.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment for this order has already been completed'
      });
    }

    // Convert amount to cents/paisa for Stripe
    const amountInSubunits = Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSubunits,
      currency,
      metadata: {
        orderId,
        userId: req.user.id
      },
      description: `Payment for order #${orderId}`,
      receipt_email: req.user.email
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete payment after frontend confirms success
 * @route   POST /api/payment/complete-payment
 * @access  Private
 */
const completePayment = async (req, res, next) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID and order ID are required'
      });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: `Payment has not been completed. Status: ${paymentIntent.status}`
      });
    }

    // Find and update order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order payment info
    order.paymentInfo = {
      paymentMethod: 'stripe',
      paymentStatus: 'completed',
      paymentId: paymentIntentId,
      paidAt: Date.now()
    };

    // Update order status
    order.orderStatus = 'processing';

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment completed successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Handle Stripe webhook events
 * @route   POST /api/payment/webhook
 * @access  Public
 */
const handleStripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle specific events
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const { orderId } = paymentIntent.metadata;

        if (orderId) {
          // Find and update order
          const order = await Order.findById(orderId);
          if (order) {
            order.paymentInfo = {
              paymentMethod: 'stripe',
              paymentStatus: 'completed',
              paymentId: paymentIntent.id,
              paidAt: Date.now()
            };
            order.orderStatus = 'processing';
            await order.save();
          }
        }
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedOrderId = failedPayment.metadata.orderId;

        if (failedOrderId) {
          // Update order with payment failure
          const order = await Order.findById(failedOrderId);
          if (order) {
            order.paymentInfo = {
              ...order.paymentInfo,
              paymentStatus: 'failed',
              paymentError: failedPayment.last_payment_error?.message || 'Payment failed'
            };
            await order.save();
          }
        }
        break;
      
      // Add more cases as needed
    }

    // Return success response to Stripe
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentIntent,
  completePayment,
  handleStripeWebhook
};
