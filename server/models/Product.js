const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be positive']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price must be positive']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot be more than 100%']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'plants',
      'tools',
      'organic-supplies',
      'organic-vegetables',
      'gifts',
      'accessories'
    ]
  },
  type: {
    type: String,
    required: [true, 'Please select a type'],
    enum: [
      'seasonal-plants',
      'indoor-plants',
      'fruit-plants',
      'flowering-plants',
      'herbs',
      'succulents',
      'gardening-tools',
      'pots-planters',
      'fertilizers',
      'seeds',
      'organic-manure',
      'cocopeat',
      'vermicompost',
      'organic-vegetables',
      'plant-gifts',
      'gift-sets',
      'care-accessories'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  weight: {
    type: Number, // in grams
    min: [0, 'Weight must be positive']
  },
  dimensions: {
    length: Number, // in cm
    width: Number,
    height: Number
  },
  careInstructions: {
    type: String,
    maxlength: [1000, 'Care instructions cannot be more than 1000 characters']
  },
  plantingSeasons: [{
    type: String,
    enum: ['spring', 'summer', 'monsoon', 'autumn', 'winter', 'year-round']
  }],
  sunlightRequirement: {
    type: String,
    enum: ['full-sun', 'partial-sun', 'shade', 'indirect-light']
  },
  wateringFrequency: {
    type: String,
    enum: ['daily', 'alternate-days', 'weekly', 'bi-weekly', 'monthly']
  },
  isOrganic: {
    type: Boolean,
    default: false
  },  isFeatured: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  inStock: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review cannot be more than 500 characters']
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: {
      type: String,
      unique: true,
      index: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create product slug from name
productSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + this._id.toString().slice(-6);
  }
  
  // Sync featured fields
  if (this.isFeatured !== undefined) {
    this.featured = this.isFeatured;
  }
  if (this.featured !== undefined) {
    this.isFeatured = this.featured;
  }
  
  // Sync seller and createdBy fields
  if (this.seller && !this.createdBy) {
    this.createdBy = this.seller;
  }
  if (this.createdBy && !this.seller) {
    this.seller = this.createdBy;
  }
  
  // Update inStock based on stock quantity
  this.inStock = this.stock > 0;
  
  next();
});

// Calculate discount price
productSchema.virtual('discountPrice').get(function() {
  if (this.discount > 0) {
    return Math.round(this.price * (1 - this.discount / 100));
  }
  return this.price;
});

// Check if product is low in stock
productSchema.virtual('isLowStock').get(function() {
  return this.stock <= this.lowStockThreshold;
});

// Indexes for better performance
productSchema.index({ category: 1, type: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
