const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Advanced product search with filters
const searchProducts = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search parameters',
        errors: errors.array()
      });
    }

    const {
      q = '',           // search query
      category = '',    // category filter
      minPrice = 0,     // minimum price
      maxPrice = 999999, // maximum price
      sortBy = 'createdAt', // sort field
      sortOrder = 'desc', // sort order
      page = 1,         // page number
      limit = 12,       // items per page
      inStock = null    // stock filter
    } = req.query;

    // Build search filter
    const filter = {};

    // Text search in name and description
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    // Price range filter
    filter.price = {
      $gte: parseFloat(minPrice),
      $lte: parseFloat(maxPrice)
    };

    // Stock filter
    if (inStock !== null) {
      if (inStock === 'true') {
        filter.countInStock = { $gt: 0 };
      } else if (inStock === 'false') {
        filter.countInStock = { $eq: 0 };
      }
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute search with pagination
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .limit(pageSize)
        .skip(skip)
        .select('-__v'),
      Product.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalProducts / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalProducts,
          hasNextPage,
          hasPrevPage,
          limit: pageSize
        },
        filters: {
          query: q,
          category,
          minPrice,
          maxPrice,
          inStock,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message
    });
  }
};

// Get all unique categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    
    // Remove empty/null categories and sort
    const validCategories = categories
      .filter(cat => cat && cat.trim())
      .sort();

    res.status(200).json({
      success: true,
      data: validCategories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message
    });
  }
};

// Get price range (min and max prices)
const getPriceRange = async (req, res) => {
  try {
    const priceStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    const { minPrice = 0, maxPrice = 0, avgPrice = 0 } = priceStats[0] || {};

    res.status(200).json({
      success: true,
      data: {
        minPrice: Math.floor(minPrice),
        maxPrice: Math.ceil(maxPrice),
        avgPrice: Math.round(avgPrice * 100) / 100
      }
    });

  } catch (error) {
    console.error('Get price range error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get price range',
      error: error.message
    });
  }
};

// Get search suggestions/autocomplete
const getSearchSuggestions = async (req, res) => {
  try {
    const { q = '' } = req.query;

    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Get product name suggestions
    const namesSuggestions = await Product.find(
      { name: { $regex: q, $options: 'i' } },
      { name: 1 }
    ).limit(5);

    // Get category suggestions
    const categorySuggestions = await Product.distinct('category', {
      category: { $regex: q, $options: 'i' }
    });

    const suggestions = [
      ...namesSuggestions.map(p => ({ type: 'product', value: p.name })),
      ...categorySuggestions.slice(0, 3).map(c => ({ type: 'category', value: c }))
    ];

    res.status(200).json({
      success: true,
      data: suggestions.slice(0, 8) // Limit to 8 suggestions
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search suggestions',
      error: error.message
    });
  }
};

module.exports = {
  searchProducts,
  getCategories,
  getPriceRange,
  getSearchSuggestions
};