const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize Razorpay instance
let razorpay;
try {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('⚠️  Razorpay credentials not found in environment variables. Payment functionality will be disabled.');
    console.warn('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
  } else {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('✓ Razorpay initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize Razorpay:', error.message);
}

/**
 * @desc    Create Razorpay order
 * @route   POST /api/payment/create-order
 * @access  Private
 */
const createRazorpayOrder = async (req, res, next) => {
  try {
    // Check if Razorpay is initialized
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Payment service is not configured. Please contact support.'
      });
    }

    const { amount, orderId } = req.body;

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

    // Convert amount to paisa (Razorpay accepts amount in paisa)
    const amountInPaisa = Math.round(amount * 100);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaisa,
      currency: 'INR',
      receipt: `order_${orderId}`,
      notes: {
        orderId,
        userId: req.user.id,
        userEmail: req.user.email
      }
    });

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment
 * @route   POST /api/payment/verify-payment
 * @access  Private
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'All payment details are required'
      });
    }

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
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
      paymentMethod: 'razorpay',
      paymentStatus: 'completed',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paidAt: Date.now()
    };

    // Update order status
    order.orderStatus = 'processing';

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified and completed successfully',
      order
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    next(error);
  }
};

/**
 * @desc    Handle Razorpay webhook events
 * @route   POST /api/payment/webhook
 * @access  Public
 */
const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const webhookSignature = req.headers['x-razorpay-signature'];
    
    if (!webhookSecret) {
      return res.status(400).json({
        success: false,
        message: 'Webhook secret not configured'
      });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;

    // Handle specific events
    switch (event) {
      case 'payment.captured':
        if (paymentEntity.notes && paymentEntity.notes.orderId) {
          const order = await Order.findById(paymentEntity.notes.orderId);
          if (order) {
            order.paymentInfo = {
              paymentMethod: 'razorpay',
              paymentStatus: 'completed',
              razorpayPaymentId: paymentEntity.id,
              razorpayOrderId: paymentEntity.order_id,
              paidAt: Date.now()
            };
            order.orderStatus = 'processing';
            await order.save();
          }
        }
        break;
      
      case 'payment.failed':
        if (paymentEntity.notes && paymentEntity.notes.orderId) {
          const order = await Order.findById(paymentEntity.notes.orderId);
          if (order) {
            order.paymentInfo = {
              ...order.paymentInfo,
              paymentStatus: 'failed',
              paymentError: paymentEntity.error_description || 'Payment failed'
            };
            await order.save();
          }
        }
        break;
      
      // Add more cases as needed
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  handleRazorpayWebhook
};
