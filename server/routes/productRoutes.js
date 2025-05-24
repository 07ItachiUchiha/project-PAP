const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts
} = require('../controllers/productController');

const { protect, authorize } = require('../middlewares/auth');
const { validate, validationSets } = require('../utils/validation');
const { cacheConfigs } = require('../utils/cache');

const router = express.Router();

// Public routes with caching
router.get('/featured', cacheConfigs.products, getFeaturedProducts);
router.get('/category/:category', cacheConfigs.categories, getProductsByCategory);
router.get('/', cacheConfigs.products, getProducts);
router.get('/:id', cacheConfigs.medium, getProduct);

// Protected admin routes with validation
router.post('/', 
  protect, 
  authorize('admin', 'seller'), 
  validate(validationSets.createProduct),
  createProduct
);

router.put('/:id', 
  protect, 
  authorize('admin', 'seller'), 
  validate(validationSets.updateProduct),
  updateProduct
);

router.delete('/:id', 
  protect, 
  authorize('admin', 'seller'), 
  deleteProduct
);

module.exports = router;
