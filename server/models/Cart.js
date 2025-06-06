const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  price: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0
  },
  appliedCoupons: [{
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalDiscount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate amounts before saving
cartSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // Calculate total discount from applied coupons
  this.totalDiscount = this.appliedCoupons.reduce((total, couponData) => {
    return total + couponData.discountAmount;
  }, 0);
  
  // Calculate final amounts
  this.totalAmount = this.subtotal;
  this.finalAmount = Math.max(0, this.subtotal - this.totalDiscount);
  
  next();
});

// Instance method to check if coupon is already applied
cartSchema.methods.hasCoupon = function(couponId) {
  return this.appliedCoupons.some(c => c.coupon.toString() === couponId.toString());
};

// Instance method to remove coupon
cartSchema.methods.removeCoupon = function(couponId) {
  this.appliedCoupons = this.appliedCoupons.filter(c => c.coupon.toString() !== couponId.toString());
};

module.exports = mongoose.model('Cart', cartSchema);
