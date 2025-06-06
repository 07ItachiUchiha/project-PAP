const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  // Basic Information
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order reference is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  returnNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Return Details
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'damaged',
        'defective',
        'wrong_item',
        'size_issue',
        'quality_issue',
        'not_as_described',
        'changed_mind',
        'duplicate_order',
        'other'
      ]
    },
    condition: {
      type: String,
      enum: ['unopened', 'opened', 'used', 'damaged'],
      default: 'unopened'
    },
    images: [{
      url: String,
      publicId: String
    }]
  }],
  
  // Return Reason & Details
  primaryReason: {
    type: String,
    required: true,
    enum: [
      'damaged',
      'defective',
      'wrong_item',
      'size_issue',
      'quality_issue',
      'not_as_described',
      'changed_mind',
      'duplicate_order',
      'other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Return description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Return Type
  returnType: {
    type: String,
    enum: ['refund', 'exchange', 'store_credit'],
    default: 'refund'
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: [
      'requested',      // Customer initiated return
      'approved',       // Return approved by admin
      'rejected',       // Return rejected
      'pickup_scheduled', // Pickup scheduled
      'picked_up',      // Item picked up from customer
      'received',       // Item received at warehouse
      'inspected',      // Item inspected
      'processed',      // Refund/exchange processed
      'completed',      // Return completed
      'cancelled'       // Return cancelled
    ],
    default: 'requested'
  },
  
  // Financial Information
  refundAmount: {
    type: Number,
    default: 0
  },
  refundMethod: {
    type: String,
    enum: ['original_payment', 'bank_transfer', 'store_credit', 'cash'],
    default: 'original_payment'
  },
  processingFee: {
    type: Number,
    default: 0
  },
  shippingRefund: {
    type: Number,
    default: 0
  },
  
  // Logistics
  returnShipping: {
    provider: String,
    trackingNumber: String,
    cost: {
      type: Number,
      default: 0
    },
    paidBy: {
      type: String,
      enum: ['customer', 'company'],
      default: 'company'
    }
  },
  
  pickupAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    contactNumber: String
  },
  
  // Quality Control
  inspection: {
    status: {
      type: String,
      enum: ['pending', 'passed', 'failed', 'partial'],
      default: 'pending'
    },
    notes: String,
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    inspectedAt: Date,
    images: [{
      url: String,
      publicId: String
    }]
  },
  
  // Communication
  customerNotes: String,
  adminNotes: String,
  
  // Important Dates
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  pickedUpAt: Date,
  receivedAt: Date,
  inspectedAt: Date,
  processedAt: Date,
  completedAt: Date,
  
  // Return Window
  eligibleUntil: {
    type: Date,
    required: true
  },
  
  // System Fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
returnSchema.index({ user: 1, createdAt: -1 });
returnSchema.index({ order: 1 });
returnSchema.index({ returnNumber: 1 }, { unique: true });
returnSchema.index({ status: 1 });
returnSchema.index({ createdAt: -1 });

// Virtual for total refund amount
returnSchema.virtual('totalRefundAmount').get(function() {
  return this.refundAmount + this.shippingRefund - this.processingFee;
});

// Virtual for return age
returnSchema.virtual('returnAge').get(function() {
  return Math.ceil((Date.now() - this.requestedAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate return number
returnSchema.pre('save', async function(next) {
  if (this.isNew && !this.returnNumber) {
    const count = await this.constructor.countDocuments();
    this.returnNumber = `RET${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to calculate refund amount
returnSchema.pre('save', function(next) {
  if (this.isModified('items') && this.items.length > 0) {
    this.refundAmount = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }
  next();
});

// Static method to check return eligibility
returnSchema.statics.checkEligibility = async function(orderId) {
  const Order = mongoose.model('Order');
  const order = await Order.findById(orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  // Check if order is eligible for return (delivered and within return window)
  if (order.status !== 'delivered') {
    return {
      eligible: false,
      reason: 'Order must be delivered to initiate return'
    };
  }
  
  // Check return window (30 days from delivery)
  const returnWindowDays = 30;
  const deliveryDate = order.deliveredAt || order.updatedAt;
  const returnDeadline = new Date(deliveryDate.getTime() + (returnWindowDays * 24 * 60 * 60 * 1000));
  
  if (Date.now() > returnDeadline) {
    return {
      eligible: false,
      reason: 'Return window has expired'
    };
  }
  
  // Check if return already exists
  const existingReturn = await this.findOne({ order: orderId });
  if (existingReturn) {
    return {
      eligible: false,
      reason: 'Return request already exists for this order'
    };
  }
  
  return {
    eligible: true,
    deadline: returnDeadline,
    daysLeft: Math.ceil((returnDeadline - Date.now()) / (1000 * 60 * 60 * 24))
  };
};

// Instance method to update status
returnSchema.methods.updateStatus = function(newStatus, notes = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Set appropriate timestamps
  const now = new Date();
  switch (newStatus) {
    case 'approved':
      this.approvedAt = now;
      break;
    case 'picked_up':
      this.pickedUpAt = now;
      break;
    case 'received':
      this.receivedAt = now;
      break;
    case 'inspected':
      this.inspectedAt = now;
      break;
    case 'processed':
      this.processedAt = now;
      break;
    case 'completed':
      this.completedAt = now;
      break;
  }
  
  if (notes) {
    this.adminNotes = (this.adminNotes || '') + `\n[${now.toISOString()}] Status changed from ${oldStatus} to ${newStatus}: ${notes}`;
  }
  
  return this.save();
};

// Instance method to calculate refund breakdown
returnSchema.methods.getRefundBreakdown = function() {
  return {
    itemsTotal: this.refundAmount,
    shippingRefund: this.shippingRefund,
    processingFee: this.processingFee,
    totalRefund: this.totalRefundAmount
  };
};

module.exports = mongoose.model('Return', returnSchema);
