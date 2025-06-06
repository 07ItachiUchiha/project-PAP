const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = catchAsync(async (req, res, next) => {
  // Validate coupon data
  const couponData = {
    ...req.body,
    createdBy: req.user.id
  };

  // Additional validation for specific coupon types
  if (couponData.type === 'percentage' && !couponData.maxDiscount) {
    return next(new AppError('Maximum discount is required for percentage coupons', 400));
  }

  if (couponData.type === 'buy_x_get_y') {
    if (!couponData.buyXGetY || !couponData.buyXGetY.buyQuantity || !couponData.buyXGetY.getQuantity) {
      return next(new AppError('Buy X Get Y details are required for this coupon type', 400));
    }
  }

  // Validate product/category references if applicable
  if (couponData.applicableProducts) {
    if (couponData.applicableProducts.type === 'specific' && couponData.applicableProducts.products) {
      const validProducts = await Product.find({ _id: { $in: couponData.applicableProducts.products } });
      if (validProducts.length !== couponData.applicableProducts.products.length) {
        return next(new AppError('One or more specified products do not exist', 400));
      }
    }
  }

  const coupon = await Coupon.create(couponData);
  await coupon.populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    data: coupon
  });
});

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
exports.getAllCoupons = catchAsync(async (req, res, next) => {
  // Build query
  let query = {};

  // Filter by status
  if (req.query.status) {
    if (req.query.status === 'active') {
      const now = new Date();
      query = {
        isActive: true,
        validFrom: { $lte: now },
        validTo: { $gte: now }
      };
    } else if (req.query.status === 'inactive') {
      query.isActive = false;
    } else if (req.query.status === 'expired') {
      query.validTo = { $lt: new Date() };
    }
  }

  // Filter by type
  if (req.query.type) {
    query.type = req.query.type;
  }

  // Search by code or name
  if (req.query.search) {
    query.$or = [
      { code: { $regex: req.query.search, $options: 'i' } },
      { name: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const total = await Coupon.countDocuments(query);
  
  const coupons = await Coupon.find(query)
    .populate('createdBy', 'name email')
    .populate('applicableProducts.products', 'name price images')
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit);

  // Calculate pagination info
  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  };

  res.status(200).json({
    success: true,
    count: coupons.length,
    pagination,
    data: coupons
  });
});

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
exports.getCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('applicableProducts.products', 'name price images category')
    .populate('usageCount.byUser.user', 'name email');

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  res.status(200).json({
    success: true,
    data: coupon
  });
});

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = catchAsync(async (req, res, next) => {
  let coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  // Don't allow updating code if coupon has been used
  if (req.body.code && coupon.usageCount.total > 0) {
    return next(new AppError('Cannot change coupon code after it has been used', 400));
  }

  // Validate product references if being updated
  if (req.body.applicableProducts && req.body.applicableProducts.products) {
    const validProducts = await Product.find({ _id: { $in: req.body.applicableProducts.products } });
    if (validProducts.length !== req.body.applicableProducts.products.length) {
      return next(new AppError('One or more specified products do not exist', 400));
    }
  }

  coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    data: coupon
  });
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  // Check if coupon has been used
  if (coupon.usageCount.total > 0) {
    return next(new AppError('Cannot delete coupon that has been used. Consider deactivating it instead.', 400));
  }

  await coupon.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully'
  });
});

// @desc    Validate coupon for user
// @route   POST /api/coupons/validate
// @access  Private
exports.validateCoupon = catchAsync(async (req, res, next) => {
  const { code, cartItems = [], userId } = req.body;

  if (!code) {
    return next(new AppError('Coupon code is required', 400));
  }

  const coupon = await Coupon.findOne({ 
    code: code.toUpperCase(),
    isActive: true 
  }).populate('applicableProducts.products');

  if (!coupon) {
    return next(new AppError('Invalid coupon code', 404));
  }

  // Check if coupon is currently valid
  if (!coupon.isCurrentlyValid) {
    let message = 'Coupon is not valid';
    const now = new Date();
    
    if (now < coupon.validFrom) {
      message = `Coupon is not yet active. Valid from ${coupon.validFrom.toDateString()}`;
    } else if (now > coupon.validTo) {
      message = `Coupon has expired on ${coupon.validTo.toDateString()}`;
    } else if (coupon.usageLimit.total && coupon.usageCount.total >= coupon.usageLimit.total) {
      message = 'Coupon usage limit has been reached';
    }
    
    return next(new AppError(message, 400));
  }

  // Check if user can use this coupon
  const actualUserId = userId || req.user.id;
  if (!coupon.canUserUse(actualUserId)) {
    return next(new AppError('You have reached the usage limit for this coupon', 400));
  }

  // Check first-time customer restriction
  if (coupon.firstTimeOnly) {
    const orderCount = await Order.countDocuments({ user: actualUserId, status: { $ne: 'cancelled' } });
    if (orderCount > 0) {
      return next(new AppError('This coupon is only valid for first-time customers', 400));
    }
  }

  // Get cart products if items provided
  let applicableProducts = [];
  let cartSubtotal = 0;
  
  if (cartItems.length > 0) {
    const productIds = cartItems.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    
    const cartProducts = cartItems.map(item => {
      const product = products.find(p => p._id.toString() === item.product.toString());
      return {
        ...product.toObject(),
        quantity: item.quantity,
        total: product.price * item.quantity
      };
    });

    cartSubtotal = cartProducts.reduce((sum, item) => sum + item.total, 0);
    applicableProducts = coupon.appliesTo(cartProducts);
  }

  // Check minimum order value
  if (coupon.minOrderValue && cartSubtotal < coupon.minOrderValue) {
    return next(new AppError(`Minimum order value of $${coupon.minOrderValue} required for this coupon`, 400));
  }

  // Calculate discount
  let discount = 0;
  let discountDetails = {};

  if (coupon.type === 'buy_x_get_y') {
    // Special handling for Buy X Get Y
    const eligibleItems = applicableProducts.filter(p => p.quantity >= coupon.buyXGetY.buyQuantity);
    if (eligibleItems.length > 0) {
      // Calculate how many free items user gets
      const sets = Math.min(
        Math.floor(eligibleItems[0].quantity / coupon.buyXGetY.buyQuantity),
        coupon.buyXGetY.maxSets
      );
      const freeItems = sets * coupon.buyXGetY.getQuantity;
      discount = freeItems * eligibleItems[0].price;
      
      discountDetails = {
        type: 'buy_x_get_y',
        buyQuantity: coupon.buyXGetY.buyQuantity,
        getQuantity: coupon.buyXGetY.getQuantity,
        freeItems,
        sets
      };
    }
  } else {
    const applicableSubtotal = applicableProducts.reduce((sum, item) => sum + item.total, 0);
    discount = coupon.calculateDiscount(applicableSubtotal, applicableProducts);
    
    discountDetails = {
      type: coupon.type,
      value: coupon.value,
      applicableSubtotal,
      maxDiscount: coupon.maxDiscount
    };
  }

  res.status(200).json({
    success: true,
    data: {
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        description: coupon.description
      },
      discount,
      discountDetails,
      applicableProducts: applicableProducts.map(p => ({
        id: p._id,
        name: p.name,
        quantity: p.quantity,
        price: p.price
      }))
    }
  });
});

// @desc    Apply coupon to order
// @route   POST /api/coupons/apply
// @access  Private
exports.applyCoupon = catchAsync(async (req, res, next) => {
  const { couponId, orderId } = req.body;

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  if (!coupon.canUserUse(req.user.id)) {
    return next(new AppError('Cannot use this coupon', 400));
  }

  // Apply usage
  await coupon.use(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Coupon applied successfully',
    data: coupon
  });
});

// @desc    Get user's available coupons
// @route   GET /api/coupons/available
// @access  Private
exports.getAvailableCoupons = catchAsync(async (req, res, next) => {
  // Check if user is first-time customer
  const orderCount = await Order.countDocuments({ 
    user: req.user.id, 
    status: { $ne: 'cancelled' } 
  });
  const isFirstTime = orderCount === 0;

  // Get all valid coupons for user
  let validCoupons = await Coupon.findValidForUser(req.user.id, isFirstTime);

  // Filter out coupons user can't use due to usage limits
  validCoupons = validCoupons.filter(coupon => coupon.canUserUse(req.user.id));

  // Get automatic coupons
  const automaticCoupons = await Coupon.findAutomatic();

  res.status(200).json({
    success: true,
    data: {
      availableCoupons: validCoupons,
      automaticCoupons: automaticCoupons.filter(coupon => coupon.canUserUse(req.user.id)),
      isFirstTimeCustomer: isFirstTime
    }
  });
});

// @desc    Get coupon statistics
// @route   GET /api/coupons/:id/stats
// @access  Private/Admin
exports.getCouponStats = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  // Get orders that used this coupon
  const orders = await Order.find({ 'discount.coupon': coupon._id })
    .populate('user', 'name email')
    .select('orderNumber total discount createdAt user status');

  // Calculate statistics
  const stats = {
    totalUses: coupon.usageCount.total,
    uniqueUsers: coupon.usageCount.byUser.length,
    remainingUses: coupon.remainingUses,
    totalSavings: orders.reduce((sum, order) => sum + (order.discount?.amount || 0), 0),
    averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
    conversionRate: coupon.usageCount.total > 0 ? (orders.filter(o => o.status === 'delivered').length / coupon.usageCount.total) * 100 : 0,
    recentOrders: orders.slice(0, 10)
  };

  res.status(200).json({
    success: true,
    data: {
      coupon,
      stats
    }
  });
});

// @desc    Bulk operations on coupons
// @route   POST /api/coupons/bulk
// @access  Private/Admin
exports.bulkOperations = catchAsync(async (req, res, next) => {
  const { operation, couponIds, data } = req.body;

  if (!operation || !couponIds || !Array.isArray(couponIds)) {
    return next(new AppError('Operation and coupon IDs are required', 400));
  }

  let result;

  switch (operation) {
    case 'activate':
      result = await Coupon.updateMany(
        { _id: { $in: couponIds } },
        { isActive: true }
      );
      break;

    case 'deactivate':
      result = await Coupon.updateMany(
        { _id: { $in: couponIds } },
        { isActive: false }
      );
      break;

    case 'delete':
      // Only delete coupons that haven't been used
      const unusedCoupons = await Coupon.find({
        _id: { $in: couponIds },
        'usageCount.total': 0
      });

      if (unusedCoupons.length !== couponIds.length) {
        return next(new AppError('Cannot delete coupons that have been used', 400));
      }

      result = await Coupon.deleteMany({
        _id: { $in: couponIds },
        'usageCount.total': 0
      });
      break;

    case 'updateExpiry':
      if (!data.validTo) {
        return next(new AppError('New expiry date is required', 400));
      }
      result = await Coupon.updateMany(
        { _id: { $in: couponIds } },
        { validTo: new Date(data.validTo) }
      );
      break;

    default:
      return next(new AppError('Invalid operation', 400));
  }

  res.status(200).json({
    success: true,
    message: `Bulk ${operation} completed successfully`,
    modifiedCount: result.modifiedCount || result.deletedCount
  });
});
