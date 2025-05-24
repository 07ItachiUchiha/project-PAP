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

const router = express.Router();

router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);

router.get('/', getProducts);
router.post('/', protect, authorize('admin', 'seller'), createProduct);

router.get('/:id', getProduct);
router.put('/:id', protect, authorize('admin', 'seller'), updateProduct);
router.delete('/:id', protect, authorize('admin', 'seller'), deleteProduct);

module.exports = router;
