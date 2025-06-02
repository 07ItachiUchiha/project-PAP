const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('items', 'name price stock originalPrice images category type inStock');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, items: [] });
      wishlist = await Wishlist.findOne({ user: req.user.id })
        .populate('items', 'name price stock originalPrice images category type inStock');
    }

    res.status(200).json({
      success: true,
      items: wishlist.items || []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, items: [] });
    }

    // Check if the product is already in the wishlist
    if (wishlist.items.includes(productId)) {
      return res.status(200).json({
        success: true,
        message: 'Product already in wishlist',
        wishlist: await Wishlist.findOne({ user: req.user.id })
          .populate('items', 'name price stock originalPrice images category type inStock')
      });
    }

    // Add product to wishlist
    wishlist.items.push(productId);
    await wishlist.save();

    // Return populated wishlist
    const populatedWishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('items', 'name price stock originalPrice images category type inStock');

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      items: populatedWishlist.items
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Remove product from wishlist
    wishlist.items = wishlist.items.filter(
      item => item.toString() !== productId
    );

    await wishlist.save();

    // Return populated wishlist
    const populatedWishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('items', 'name price stock originalPrice images category type inStock');

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      items: populatedWishlist.items
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully',
      items: []
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
};
