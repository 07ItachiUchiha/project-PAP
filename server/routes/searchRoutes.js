const express = require('express');
const { body, query } = require('express-validator');
const {
  searchProducts,
  getCategories,
  getPriceRange,
  getSearchSuggestions
} = require('../controllers/searchController');

const router = express.Router();

// Validation rules for search
const searchValidation = [
  query('q').optional().isString().trim().escape(),
  query('category').optional().isString().trim().escape(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('sortBy').optional().isIn(['name', 'price', 'createdAt', 'rating']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('inStock').optional().isIn(['true', 'false'])
];

// Search products with filters
// GET /api/search/products
router.get('/products', searchValidation, searchProducts);

// Get all categories
// GET /api/search/categories
router.get('/categories', getCategories);

// Get price range
// GET /api/search/price-range
router.get('/price-range', getPriceRange);

// Get search suggestions/autocomplete
// GET /api/search/suggestions
router.get('/suggestions', [
  query('q').notEmpty().isString().trim().escape()
], getSearchSuggestions);

module.exports = router;