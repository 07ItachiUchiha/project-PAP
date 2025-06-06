const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');

// @desc    Get all reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = '-createdAt', rating, verified } = req.query;

  // Build query
  const query = { 
    product: productId, 
    status: 'approved' 
  };

  if (rating) {
    query.rating = rating;
  }

  if (verified === 'true') {
    query.verified = true;
  }

  // Parse sort parameter
  let sortObj = {};
  if (sort.startsWith('-')) {
    sortObj[sort.substring(1)] = -1;
  } else {
    sortObj[sort] = 1;
  }

  const reviews = await Review.find(query)
    .populate('user', 'name avatar')
    .sort(sortObj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const total = await Review.countDocuments(query);
  // Get rating statistics
  const ratingStats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    }
  ]);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingStats.forEach(stat => {
    distribution[stat._id] = stat.count;
  });

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total,
        distribution,        averageRating: await Review.aggregate([
          { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
          { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]).then(result => result[0]?.avg || 0)
      }
    }
  });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
const getUserReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const reviews = await Review.find({ user: req.user.id })
    .populate('product', 'name images price')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const total = await Review.countDocuments({ user: req.user.id });

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Create a review
// @route   POST /api/products/:productId/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { productId } = req.params;
  const { rating, title, comment, pros, cons, orderId } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check if user has purchased this product
  const order = await Order.findOne({
    _id: orderId,
    user: req.user.id,
    'items.product': productId,
    status: 'delivered'
  });

  if (!order) {
    return res.status(400).json({
      success: false,
      message: 'You can only review products you have purchased and received'
    });
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user.id
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this product'
    });
  }

  // Create review
  const review = await Review.create({
    product: productId,
    user: req.user.id,
    order: orderId,
    rating,
    title,
    comment,
    pros: pros || [],
    cons: cons || []
  });

  await review.populate('user', 'name avatar');

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if user owns the review
  if (review.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this review'
    });
  }

  // Update fields
  const { rating, title, comment, pros, cons } = req.body;
  review.rating = rating || review.rating;
  review.title = title || review.title;
  review.comment = comment || review.comment;
  review.pros = pros !== undefined ? pros : review.pros;
  review.cons = cons !== undefined ? cons : review.cons;

  await review.save();
  await review.populate('user', 'name avatar');

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this review'
    });
  }

  await review.remove();

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
const markReviewHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  const wasMarked = await review.markHelpful(req.user.id);

  if (!wasMarked) {
    return res.status(400).json({
      success: false,
      message: 'You have already marked this review as helpful'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      helpfulCount: review.helpful.count,
      message: 'Review marked as helpful'
    }
  });
});

// @desc    Unmark review as helpful
// @route   DELETE /api/reviews/:id/helpful
// @access  Private
const unmarkReviewHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  const wasUnmarked = await review.unmarkHelpful(req.user.id);

  if (!wasUnmarked) {
    return res.status(400).json({
      success: false,
      message: 'You have not marked this review as helpful'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      helpfulCount: review.helpful.count,
      message: 'Review unmarked as helpful'
    }
  });
});

// @desc    Report a review
// @route   POST /api/reviews/:id/report
// @access  Private
const reportReview = asyncHandler(async (req, res) => {
  const { reason, comment } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a reason for reporting'
    });
  }

  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  const wasReported = await review.reportReview(req.user.id, reason, comment);

  if (!wasReported) {
    return res.status(400).json({
      success: false,
      message: 'You have already reported this review'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Review reported successfully'
  });
});

// @desc    Get review statistics
// @route   GET /api/products/:productId/reviews/stats
// @access  Public
const getReviewStats = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratings: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        totalReviews: 0,
        averageRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        percentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    });
  }

  const { totalReviews, averageRating, ratings } = stats[0];
  
  // Calculate distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(rating => {
    distribution[rating]++;
  });

  // Calculate percentages
  const percentages = {};
  Object.keys(distribution).forEach(rating => {
    percentages[rating] = totalReviews > 0 ? 
      Math.round((distribution[rating] / totalReviews) * 100) : 0;
  });

  res.status(200).json({
    success: true,
    data: {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      distribution,
      percentages
    }
  });
});

// @desc    Check if user can review product
// @route   GET /api/products/:productId/reviews/can-review
// @access  Private
const canUserReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // Check if user has purchased this product
  const order = await Order.findOne({
    user: req.user.id,
    'items.product': productId,
    status: 'delivered'
  });

  if (!order) {
    return res.status(200).json({
      success: true,
      data: {
        canReview: false,
        reason: 'Must purchase and receive product to review'
      }
    });
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user.id
  });

  if (existingReview) {
    return res.status(200).json({
      success: true,
      data: {
        canReview: false,
        reason: 'You have already reviewed this product',
        existingReview: existingReview._id
      }
    });
  }

  res.status(200).json({
    success: true,
    data: {
      canReview: true,
      orderId: order._id
    }
  });
});

module.exports = {
  getProductReviews,
  getUserReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  unmarkReviewHelpful,
  reportReview,
  getReviewStats,
  canUserReview
};
