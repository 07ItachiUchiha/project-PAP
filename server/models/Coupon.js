const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Coupon code must be at least 3 characters'],
    maxlength: [20, 'Coupon code cannot exceed 20 characters'],
    match: [/^[A-Z0-9]+$/, 'Coupon code can only contain letters and numbers']
  },
  name: {
    type: String,
    required: [true, 'Coupon name is required'],
    trim: true,
    maxlength: [100, 'Coupon name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: [true, 'Coupon type is required'],
    enum: ['percentage', 'fixed', 'free_shipping', 'buy_x_get_y'],
    default: 'percentage'
  },
  value: {
    type: Number,
    required: [true, 'Coupon value is required'],
    min: [0, 'Coupon value must be positive']
  },
  maxDiscount: {
    type: Number,
    min: [0, 'Maximum discount must be positive'],
    // Only applies to percentage coupons
    validate: {
      validator: function(v) {
        return this.type !== 'percentage' || v > 0;
      },
      message: 'Maximum discount is required for percentage coupons'
    }
  },
  minOrderValue: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order value must be positive']
  },
  usageLimit: {
    total: {
      type: Number,
      default: null, // null means unlimited
      min: [1, 'Total usage limit must be at least 1']
    },
    perUser: {
      type: Number,
      default: 1,
      min: [1, 'Per user limit must be at least 1']
    }
  },
  usageCount: {
    total: {
      type: Number,
      default: 0
    },
    byUser: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      count: {
        type: Number,
        default: 0
      },
      lastUsed: {
        type: Date,
        default: Date.now
      }
    }]
  },
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required'],
    default: Date.now
  },
  validTo: {
    type: Date,
    required: [true, 'Valid to date is required'],
    validate: {
      validator: function(v) {
        return v > this.validFrom;
      },
      message: 'Valid to date must be after valid from date'
    }
  },
  applicableProducts: {
    type: {
      type: String,
      enum: ['all', 'specific', 'category', 'exclude'],
      default: 'all'
    },
    products: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    }],
    categories: [{
      type: String,
      enum: ['plants', 'tools', 'organic-supplies', 'organic-vegetables', 'gifts', 'accessories']
    }],
    excludedProducts: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    }]
  },
  buyXGetY: {
    buyQuantity: {
      type: Number,
      min: [1, 'Buy quantity must be at least 1']
    },
    getQuantity: {
      type: Number,
      min: [1, 'Get quantity must be at least 1']
    },
    maxSets: {
      type: Number,
      default: 1,
      min: [1, 'Max sets must be at least 1']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAutomatic: {
    type: Boolean,
    default: false // If true, applies automatically when conditions are met
  },
  stackable: {
    type: Boolean,
    default: false // Can be combined with other coupons
  },
  firstTimeOnly: {
    type: Boolean,
    default: false // Only for first-time customers
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  internalNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Internal notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });
couponSchema.index({ 'applicableProducts.type': 1 });
couponSchema.index({ 'applicableProducts.categories': 1 });

// Virtual for checking if coupon is currently valid
couponSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  return this.isActive && 
         now >= this.validFrom && 
         now <= this.validTo &&
         (this.usageLimit.total === null || this.usageCount.total < this.usageLimit.total);
});

// Virtual for remaining uses
couponSchema.virtual('remainingUses').get(function() {
  if (this.usageLimit.total === null) return null;
  return Math.max(0, this.usageLimit.total - this.usageCount.total);
});

// Method to check if user can use this coupon
couponSchema.methods.canUserUse = function(userId) {
  if (!this.isCurrentlyValid) return false;
  
  const userUsage = this.usageCount.byUser.find(u => u.user.toString() === userId.toString());
  const userCount = userUsage ? userUsage.count : 0;
  
  return userCount < this.usageLimit.perUser;
};

// Method to check if coupon applies to products
couponSchema.methods.appliesTo = function(products) {
  if (this.applicableProducts.type === 'all') {
    return products.filter(p => !this.applicableProducts.excludedProducts.includes(p._id));
  }
  
  if (this.applicableProducts.type === 'specific') {
    return products.filter(p => this.applicableProducts.products.includes(p._id));
  }
  
  if (this.applicableProducts.type === 'category') {
    return products.filter(p => this.applicableProducts.categories.includes(p.category));
  }
  
  if (this.applicableProducts.type === 'exclude') {
    return products.filter(p => !this.applicableProducts.excludedProducts.includes(p._id));
  }
  
  return [];
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(subtotal, applicableProducts = []) {
  if (!this.isCurrentlyValid) return 0;
  
  let discount = 0;
  
  switch (this.type) {
    case 'percentage':
      discount = (subtotal * this.value) / 100;
      if (this.maxDiscount) {
        discount = Math.min(discount, this.maxDiscount);
      }
      break;
      
    case 'fixed':
      discount = Math.min(this.value, subtotal);
      break;
      
    case 'free_shipping':
      // This would be handled in shipping calculation
      discount = 0;
      break;
      
    case 'buy_x_get_y':
      // This would need special handling in cart logic
      discount = 0;
      break;
      
    default:
      discount = 0;
  }
  
  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

// Method to apply coupon usage
couponSchema.methods.use = async function(userId) {
  // Increment total usage
  this.usageCount.total += 1;
  
  // Update user usage
  const userUsageIndex = this.usageCount.byUser.findIndex(u => u.user.toString() === userId.toString());
  
  if (userUsageIndex >= 0) {
    this.usageCount.byUser[userUsageIndex].count += 1;
    this.usageCount.byUser[userUsageIndex].lastUsed = new Date();
  } else {
    this.usageCount.byUser.push({
      user: userId,
      count: 1,
      lastUsed: new Date()
    });
  }
  
  await this.save();
};

// Static method to find valid coupons for user
couponSchema.statics.findValidForUser = function(userId, isFirstTime = false) {
  const now = new Date();
  
  const query = {
    isActive: true,
    validFrom: { $lte: now },
    validTo: { $gte: now },
    $or: [
      { 'usageLimit.total': null },
      { $expr: { $lt: ['$usageCount.total', '$usageLimit.total'] } }
    ]
  };
  
  if (isFirstTime) {
    query.firstTimeOnly = true;
  }
  
  return this.find(query);
};

// Static method to find automatic coupons
couponSchema.statics.findAutomatic = function() {
  const now = new Date();
  
  return this.find({
    isActive: true,
    isAutomatic: true,
    validFrom: { $lte: now },
    validTo: { $gte: now },
    $or: [
      { 'usageLimit.total': null },
      { $expr: { $lt: ['$usageCount.total', '$usageLimit.total'] } }
    ]
  });
};

// Pre-save middleware to set defaults for buy_x_get_y
couponSchema.pre('save', function(next) {
  if (this.type === 'buy_x_get_y') {
    if (!this.buyXGetY.buyQuantity) this.buyXGetY.buyQuantity = 1;
    if (!this.buyXGetY.getQuantity) this.buyXGetY.getQuantity = 1;
    if (!this.buyXGetY.maxSets) this.buyXGetY.maxSets = 1;
  }
  next();
});

module.exports = mongoose.model('Coupon', couponSchema);
