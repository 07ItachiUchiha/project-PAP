const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price images inStock discount originalPrice');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Filter out items with null products (orphaned cart items) and save if needed
    const originalItemCount = cart.items.length;
    cart.items = cart.items.filter(item => item.product && item.product._id);
    
    // If we found orphaned items, save the cleaned cart
    if (cart.items.length < originalItemCount) {
      await cart.save();
      console.log(`Cleaned up ${originalItemCount - cart.items.length} orphaned cart items for user ${req.user.id}`);
    }

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.inStock) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock'
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }

    await cart.save();

    // Populate and return updated cart
    cart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images inStock discount originalPrice');

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price;

    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images inStock discount originalPrice');

    res.status(200).json({
      success: true,
      cart: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images inStock discount originalPrice');

    res.status(200).json({
      success: true,
      cart: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    cart.discount = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/apply-coupon
// @access  Private
const applyCouponToCart = async (req, res, next) => {
  try {
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    // Find coupon
    const coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase(),
      isActive: true 
    }).populate('applicableProducts.products');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check if coupon is currently valid
    if (!coupon.isCurrentlyValid) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is not valid or has expired'
      });
    }

    // Check if user can use this coupon
    if (!coupon.canUserUse(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You have reached the usage limit for this coupon'
      });
    }

    // Get user's cart
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price category images')
      .populate('appliedCoupons.coupon', 'name code type value');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Check if coupon is already applied
    if (cart.hasCoupon(coupon._id)) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is already applied to your cart'
      });
    }

    // Check minimum order value
    if (coupon.minOrderValue && cart.subtotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of $${coupon.minOrderValue} required for this coupon`
      });
    }

    // Check first-time customer restriction
    if (coupon.firstTimeOnly) {
      const { default: Order } = await import('../models/Order.js');
      const orderCount = await Order.countDocuments({ 
        user: req.user.id, 
        status: { $ne: 'cancelled' } 
      });
      if (orderCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is only valid for first-time customers'
        });
      }
    }    // Get applicable products - only use valid items with products
    const validItems = cart.items.filter(item => item.product && item.product._id);
    const cartProducts = validItems.map(item => ({
      _id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      category: item.product.category,
      quantity: item.quantity,
      total: item.product.price * item.quantity
    }));

    const applicableProducts = coupon.appliesTo(cartProducts);
    
    if (applicableProducts.length === 0 && coupon.applicableProducts.type !== 'all') {
      return res.status(400).json({
        success: false,
        message: 'This coupon is not applicable to any items in your cart'
      });
    }

    // Calculate discount
    const applicableSubtotal = applicableProducts.length > 0 
      ? applicableProducts.reduce((sum, item) => sum + item.total, 0)
      : cart.subtotal;
    
    const discountAmount = coupon.calculateDiscount(applicableSubtotal, applicableProducts);

    if (discountAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Coupon does not provide any discount for your cart'
      });
    }

    // Apply coupon to cart
    cart.appliedCoupons.push({
      coupon: coupon._id,
      discountAmount: discountAmount
    });

    await cart.save();

    // Populate updated cart
    cart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images inStock discount originalPrice category')
      .populate('appliedCoupons.coupon', 'name code type value description');

    res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully! You saved $${discountAmount.toFixed(2)}`,
      cart,
      discountAmount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/remove-coupon/:couponId
// @access  Private
const removeCouponFromCart = async (req, res, next) => {
  try {
    const { couponId } = req.params;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    if (!cart.hasCoupon(couponId)) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is not applied to your cart'
      });
    }

    cart.removeCoupon(couponId);
    await cart.save();

    // Populate updated cart
    cart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images inStock discount originalPrice category')
      .populate('appliedCoupons.coupon', 'name code type value description');

    res.status(200).json({
      success: true,
      message: 'Coupon removed successfully',
      cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available coupons for current cart
// @route   GET /api/cart/available-coupons
// @access  Private
const getAvailableCouponsForCart = async (req, res, next) => {
  try {
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price category');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Filter out items with null products (orphaned cart items)
    const validItems = cart.items.filter(item => item.product && item.product._id);
    
    if (validItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart contains no valid products'
      });
    }

    // Check if user is first-time customer
    const { default: Order } = await import('../models/Order.js');
    const orderCount = await Order.countDocuments({ 
      user: req.user.id, 
      status: { $ne: 'cancelled' } 
    });
    const isFirstTime = orderCount === 0;

    // Get all valid coupons
    let availableCoupons = await Coupon.findValidForUser(req.user.id, isFirstTime);
    
    // Filter coupons based on cart - only use valid items
    const cartProducts = validItems.map(item => ({
      _id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      category: item.product.category,
      quantity: item.quantity,
      total: item.product.price * item.quantity
    }));

    const eligibleCoupons = availableCoupons.filter(coupon => {
      // Skip if already applied
      if (cart.hasCoupon(coupon._id)) return false;
      
      // Check if user can use it
      if (!coupon.canUserUse(req.user.id)) return false;
      
      // Check minimum order value
      if (coupon.minOrderValue && cart.subtotal < coupon.minOrderValue) return false;
      
      // Check if applies to cart items
      if (coupon.applicableProducts.type !== 'all') {
        const applicableProducts = coupon.appliesTo(cartProducts);
        if (applicableProducts.length === 0) return false;
      }
      
      return true;
    });

    // Calculate potential discounts
    const couponsWithDiscounts = eligibleCoupons.map(coupon => {
      const applicableProducts = coupon.appliesTo(cartProducts);
      const applicableSubtotal = applicableProducts.length > 0 
        ? applicableProducts.reduce((sum, item) => sum + item.total, 0)
        : cart.subtotal;
      
      const potentialDiscount = coupon.calculateDiscount(applicableSubtotal, applicableProducts);
      
      return {
        ...coupon.toObject(),
        potentialDiscount,
        applicableProducts: applicableProducts.length
      };
    });

    // Sort by potential discount (highest first)
    couponsWithDiscounts.sort((a, b) => b.potentialDiscount - a.potentialDiscount);

    res.status(200).json({
      success: true,
      cartSubtotal: cart.subtotal,
      availableCoupons: couponsWithDiscounts,
      isFirstTimeCustomer: isFirstTime
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCouponToCart,
  removeCouponFromCart,
  getAvailableCouponsForCart
};
