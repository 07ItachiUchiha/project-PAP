const express = require('express');
const {
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
} = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');
const { body } = require('express-validator');

const router = express.Router({ mergeParams: true });

// Validation middleware for review creation/update
const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  body('pros')
    .optional()
    .isArray()
    .withMessage('Pros must be an array'),
  body('pros.*')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Each pro point must be under 200 characters'),
  body('cons')
    .optional()
    .isArray()
    .withMessage('Cons must be an array'),
  body('cons.*')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Each con point must be under 200 characters'),
  body('orderId')
    .isMongoId()
    .withMessage('Valid order ID is required')
];

// Routes that work with productId in params (from productRoutes)
router.route('/')
  .get(getProductReviews)
  .post(protect, reviewValidation, createReview);

router.get('/stats', getReviewStats);
router.get('/can-review', protect, canUserReview);

// Routes for individual reviews
router.route('/:id')
  .put(protect, reviewValidation, updateReview)
  .delete(protect, deleteReview);

router.route('/:id/helpful')
  .post(protect, markReviewHelpful)
  .delete(protect, unmarkReviewHelpful);

router.post('/:id/report', protect, [
  body('reason')
    .isIn(['inappropriate', 'spam', 'fake', 'offensive', 'other'])
    .withMessage('Invalid report reason'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Report comment must be under 500 characters')
], reportReview);

// User's reviews (mounted on main reviews route)
router.get('/user/my-reviews', protect, getUserReviews);

module.exports = router;
