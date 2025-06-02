const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Add unique compound index to prevent duplicate items
wishlistSchema.index({ user: 1, 'items': 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
