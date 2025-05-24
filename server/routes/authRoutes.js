const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const { protect } = require('../middlewares/auth');
const { validate, validationSets } = require('../utils/validation');
const { cacheConfigs } = require('../utils/cache');

const router = express.Router();

// Public routes with validation
router.post('/register', validate(validationSets.register), register);
router.post('/login', validate(validationSets.login), login);
router.post('/forgot-password', validate(validationSets.forgotPassword), forgotPassword);
router.put('/reset-password/:resettoken', validate(validationSets.resetPassword), resetPassword);

// Protected routes
router.post('/logout', logout);
router.get('/me', protect, cacheConfigs.profile, getMe);
router.put('/update', protect, validate(validationSets.updateProfile), updateDetails);
router.put('/change-password', protect, validate(validationSets.changePassword), updatePassword);

module.exports = router;
