const Return = require('../models/Return');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { emailService } = require('../utils/emailService');

// @desc    Create a return request
// @route   POST /api/returns
// @access  Private
const createReturnRequest = catchAsync(async (req, res, next) => {
  const {
    orderId,
    items,
    primaryReason,
    description,
    returnType,
    pickupAddress,
    customerNotes
  } = req.body;

  // Validate required fields
  if (!orderId || !items || !primaryReason || !description) {
    return next(new AppError('Missing required fields', 400));
  }

  // Check return eligibility
  const eligibility = await Return.checkEligibility(orderId);
  if (!eligibility.eligible) {
    return next(new AppError(eligibility.reason, 400));
  }

  // Fetch the order to validate items and calculate amounts
  const order = await Order.findById(orderId).populate('items.product');
  if (!order || order.user.toString() !== req.user.id) {
    return next(new AppError('Order not found or unauthorized', 404));
  }

  // Validate return items against order items
  const validatedItems = [];
  let totalRefundAmount = 0;

  for (const returnItem of items) {
    const orderItem = order.items.find(
      item => item.product._id.toString() === returnItem.product
    );

    if (!orderItem) {
      return next(new AppError(`Product ${returnItem.product} not found in order`, 400));
    }

    if (returnItem.quantity > orderItem.quantity) {
      return next(new AppError(`Cannot return more than ordered quantity for product ${orderItem.product.name}`, 400));
    }

    validatedItems.push({
      product: returnItem.product,
      quantity: returnItem.quantity,
      price: orderItem.price,
      reason: returnItem.reason || primaryReason,
      condition: returnItem.condition || 'unopened',
      images: returnItem.images || []
    });

    totalRefundAmount += orderItem.price * returnItem.quantity;
  }

  // Calculate eligible return date (30 days from delivery)
  const deliveryDate = order.deliveredAt || order.updatedAt;
  const eligibleUntil = new Date(deliveryDate.getTime() + (30 * 24 * 60 * 60 * 1000));

  // Create return request
  const returnRequest = await Return.create({
    order: orderId,
    user: req.user.id,
    items: validatedItems,
    primaryReason,
    description,
    returnType: returnType || 'refund',
    pickupAddress: pickupAddress || order.shippingAddress,
    customerNotes,
    eligibleUntil,
    refundAmount: totalRefundAmount
  });
  await returnRequest.populate([
    { path: 'order', select: 'orderNumber status total' },
    { path: 'items.product', select: 'name images price' },
    { path: 'user', select: 'name email phone' }
  ]);

  // Send confirmation email
  try {
    await emailService.sendReturnRequestConfirmation(returnRequest, req.user);
  } catch (error) {
    console.error('Failed to send return confirmation email:', error);
    // Don't fail the request if email fails
  }

  res.status(201).json({
    success: true,
    data: returnRequest,
    message: 'Return request created successfully'
  });
});

// @desc    Get user's return requests
// @route   GET /api/returns/my-returns
// @access  Private
const getUserReturns = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { user: req.user.id };
  if (status) {
    query.status = status;
  }

  const returns = await Return.find(query)
    .populate([
      { path: 'order', select: 'orderNumber status total deliveredAt' },
      { path: 'items.product', select: 'name images price' }
    ])
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Return.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      returns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single return request
// @route   GET /api/returns/:id
// @access  Private
const getReturnById = catchAsync(async (req, res, next) => {
  const returnRequest = await Return.findById(req.params.id)
    .populate([
      { path: 'order', select: 'orderNumber status total deliveredAt shippingAddress' },
      { path: 'items.product', select: 'name images price category' },
      { path: 'user', select: 'name email phone' },
      { path: 'inspection.inspector', select: 'name email' }
    ]);

  if (!returnRequest) {
    return next(new AppError('Return request not found', 404));
  }

  // Check authorization
  if (returnRequest.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to access this return', 403));
  }

  res.status(200).json({
    success: true,
    data: returnRequest
  });
});

// @desc    Update return request (customer)
// @route   PUT /api/returns/:id
// @access  Private
const updateReturnRequest = catchAsync(async (req, res, next) => {
  const returnRequest = await Return.findById(req.params.id);

  if (!returnRequest) {
    return next(new AppError('Return request not found', 404));
  }

  // Check authorization
  if (returnRequest.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this return', 403));
  }

  // Only allow updates if status is 'requested'
  if (returnRequest.status !== 'requested') {
    return next(new AppError('Cannot update return request after processing has started', 400));
  }

  const allowedUpdates = ['description', 'customerNotes', 'pickupAddress'];
  const updates = {};

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  Object.assign(returnRequest, updates);
  await returnRequest.save();

  await returnRequest.populate([
    { path: 'order', select: 'orderNumber status total' },
    { path: 'items.product', select: 'name images price' }
  ]);

  res.status(200).json({
    success: true,
    data: returnRequest,
    message: 'Return request updated successfully'
  });
});

// @desc    Cancel return request
// @route   DELETE /api/returns/:id
// @access  Private
const cancelReturnRequest = catchAsync(async (req, res, next) => {
  const returnRequest = await Return.findById(req.params.id);

  if (!returnRequest) {
    return next(new AppError('Return request not found', 404));
  }

  // Check authorization
  if (returnRequest.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to cancel this return', 403));
  }

  // Only allow cancellation if not yet processed
  const cancellableStatuses = ['requested', 'approved', 'pickup_scheduled'];
  if (!cancellableStatuses.includes(returnRequest.status)) {
    return next(new AppError('Cannot cancel return at this stage', 400));
  }
  await returnRequest.updateStatus('cancelled', req.body.reason || 'Cancelled by user');

  await returnRequest.populate([
    { path: 'user', select: 'name email' }
  ]);

  // Send cancellation email
  try {
    await emailService.sendReturnStatusUpdate(returnRequest, returnRequest.user, 'cancelled');
  } catch (error) {
    console.error('Failed to send return cancellation email:', error);
    // Don't fail the request if email fails
  }

  res.status(200).json({
    success: true,
    message: 'Return request cancelled successfully'
  });
});

// @desc    Check return eligibility for an order
// @route   GET /api/returns/check-eligibility/:orderId
// @access  Private
const checkReturnEligibility = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;

  // Verify order belongs to user
  const order = await Order.findById(orderId);
  if (!order || order.user.toString() !== req.user.id) {
    return next(new AppError('Order not found', 404));
  }

  const eligibility = await Return.checkEligibility(orderId);

  res.status(200).json({
    success: true,
    data: eligibility
  });
});

// ===== ADMIN ENDPOINTS =====

// @desc    Get all return requests (Admin)
// @route   GET /api/admin/returns
// @access  Private/Admin
const getAdminReturns = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    status,
    returnType,
    dateFrom,
    dateTo,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};

  if (status) query.status = status;
  if (returnType) query.returnType = returnType;

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  if (search) {
    query.$or = [
      { returnNumber: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const returns = await Return.find(query)
    .populate([
      { path: 'order', select: 'orderNumber status total deliveredAt' },
      { path: 'user', select: 'name email phone' },
      { path: 'items.product', select: 'name images price' }
    ])
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Return.countDocuments(query);

  // Get statistics
  const stats = await Return.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$refundAmount' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      returns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    }
  });
});

// @desc    Update return status (Admin)
// @route   PUT /api/admin/returns/:id/status
// @access  Private/Admin
const updateReturnStatus = catchAsync(async (req, res, next) => {
  const { status, notes, refundAmount, processingFee, shippingRefund } = req.body;

  const returnRequest = await Return.findById(req.params.id);
  if (!returnRequest) {
    return next(new AppError('Return request not found', 404));
  }

  // Update financial details if provided
  if (refundAmount !== undefined) returnRequest.refundAmount = refundAmount;
  if (processingFee !== undefined) returnRequest.processingFee = processingFee;
  if (shippingRefund !== undefined) returnRequest.shippingRefund = shippingRefund;
  // Update status
  const oldStatus = returnRequest.status;
  await returnRequest.updateStatus(status, notes);

  await returnRequest.populate([
    { path: 'order', select: 'orderNumber status total' },
    { path: 'user', select: 'name email phone' },
    { path: 'items.product', select: 'name images price' }
  ]);

  // Send status update email if status changed
  if (oldStatus !== status) {
    try {
      if (status === 'completed') {
        await emailService.sendReturnCompleted(returnRequest, returnRequest.user);
      } else {
        await emailService.sendReturnStatusUpdate(returnRequest, returnRequest.user, status);
      }
    } catch (error) {
      console.error('Failed to send return status update email:', error);
      // Don't fail the request if email fails
    }
  }

  res.status(200).json({
    success: true,
    data: returnRequest,
    message: 'Return status updated successfully'
  });
});

// @desc    Process return inspection (Admin)
// @route   PUT /api/admin/returns/:id/inspection
// @access  Private/Admin
const processInspection = catchAsync(async (req, res, next) => {
  const { status, notes, images } = req.body;

  const returnRequest = await Return.findById(req.params.id);
  if (!returnRequest) {
    return next(new AppError('Return request not found', 404));
  }

  // Update inspection details
  returnRequest.inspection = {
    status,
    notes,
    inspector: req.user.id,
    inspectedAt: new Date(),
    images: images || []
  };
  // Auto-update return status based on inspection
  if (status === 'passed') {
    await returnRequest.updateStatus('processed', 'Inspection passed - processing refund');
  } else if (status === 'failed') {
    await returnRequest.updateStatus('rejected', `Inspection failed: ${notes}`);
  }

  await returnRequest.save();

  await returnRequest.populate([
    { path: 'inspection.inspector', select: 'name email' },
    { path: 'user', select: 'name email' }
  ]);

  // Send status update email based on inspection result
  try {
    if (status === 'passed') {
      await emailService.sendReturnStatusUpdate(returnRequest, returnRequest.user, 'processed');
    } else if (status === 'failed') {
      await emailService.sendReturnStatusUpdate(returnRequest, returnRequest.user, 'rejected');
    }
  } catch (error) {
    console.error('Failed to send inspection result email:', error);
    // Don't fail the request if email fails
  }

  res.status(200).json({
    success: true,
    data: returnRequest,
    message: 'Inspection processed successfully'
  });
});

// @desc    Get return analytics (Admin)
// @route   GET /api/admin/returns/analytics
// @access  Private/Admin
const getReturnAnalytics = catchAsync(async (req, res, next) => {
  const { period = '30', startDate, endDate } = req.query;

  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
  } else {
    const days = parseInt(period);
    dateFilter = {
      createdAt: {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    };
  }

  // General statistics
  const [
    totalReturns,
    statusStats,
    reasonStats,
    monthlyTrends,
    topProducts
  ] = await Promise.all([
    Return.countDocuments(dateFilter),
    
    Return.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$refundAmount' } } }
    ]),
    
    Return.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$primaryReason', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    
    Return.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalValue: { $sum: '$refundAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    
    Return.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          count: { $sum: '$items.quantity' },
          totalValue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalReturns,
      statusStats,
      reasonStats,
      monthlyTrends,
      topProducts,
      period: period
    }
  });
});

module.exports = {
  createReturnRequest,
  getUserReturns,
  getReturnById,
  updateReturnRequest,
  cancelReturnRequest,
  checkReturnEligibility,
  
  // Admin functions
  getAdminReturns,
  updateReturnStatus,
  processInspection,
  getReturnAnalytics
};
