const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Review must belong to a product'],
    index: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user'],
    index: true
  },
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: [true, 'Review must be from a verified purchase']
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  title: {
    type: String,
    required: [true, 'Please provide a review title'],
    trim: true,
    maxlength: [100, 'Review title cannot be more than 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    trim: true,
    maxlength: [1000, 'Review comment cannot be more than 1000 characters']
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: [200, 'Pro point cannot be more than 200 characters']
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: [200, 'Con point cannot be more than 200 characters']
  }],
  images: [{
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    originalName: String,
    size: Number
  }],
  verified: {
    type: Boolean,
    default: true // Since it's from a verified purchase
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }]
  },
  reported: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }],
    reasons: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      reason: {
        type: String,
        enum: ['inappropriate', 'spam', 'fake', 'offensive', 'other']
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  adminReply: {
    message: String,
    repliedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    repliedAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'approved'
  },
  moderationNotes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Index for efficient querying
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });

// Virtual for review age
reviewSchema.virtual('age').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
});

// Pre-save middleware to update product ratings
reviewSchema.post('save', async function() {
  await this.constructor.calcAverageRatings(this.product);
});

// Pre-remove middleware to update product ratings
reviewSchema.pre('remove', async function() {
  await this.constructor.calcAverageRatings(this.product);
});

// Static method to calculate average ratings
reviewSchema.statics.calcAverageRatings = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { 
        product: productId,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length > 0) {
    const { averageRating, totalReviews, ratingDistribution } = stats[0];
    
    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });

    await mongoose.model('Product').findByIdAndUpdate(productId, {
      'ratings.average': Math.round(averageRating * 10) / 10,
      'ratings.count': totalReviews,
      'ratings.distribution': distribution
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      'ratings.average': 0,
      'ratings.count': 0,
      'ratings.distribution': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });
  }
};

// Method to mark review as helpful
reviewSchema.methods.markHelpful = async function(userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count++;
    await this.save();
    return true;
  }
  return false;
};

// Method to unmark review as helpful
reviewSchema.methods.unmarkHelpful = async function(userId) {
  const userIndex = this.helpful.users.indexOf(userId);
  if (userIndex > -1) {
    this.helpful.users.splice(userIndex, 1);
    this.helpful.count--;
    await this.save();
    return true;
  }
  return false;
};

// Method to report review
reviewSchema.methods.reportReview = async function(userId, reason, comment) {
  if (!this.reported.users.includes(userId)) {
    this.reported.users.push(userId);
    this.reported.count++;
    this.reported.reasons.push({
      user: userId,
      reason,
      comment
    });
    
    // Auto-hide if too many reports
    if (this.reported.count >= 5) {
      this.status = 'hidden';
    }
    
    await this.save();
    return true;
  }
  return false;
};

module.exports = mongoose.model('Review', reviewSchema);
