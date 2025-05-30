const express = require('express');
const { uploadProductImages, deleteProductImage } = require('../controllers/uploadController');
const { protect, authorize } = require('../middlewares/auth');
const { upload } = require('../utils/fileUpload');

const router = express.Router();

// All routes are protected and require admin access
router.use(protect);
router.use(authorize('admin', 'seller'));

// Upload product images route (multiple images)
router.post('/product-images', upload.array('images', 5), uploadProductImages);

// Delete product image route
router.delete('/product-image', deleteProductImage);

module.exports = router;
