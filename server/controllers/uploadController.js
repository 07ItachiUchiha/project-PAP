const fs = require('fs');
const path = require('path');
const { deleteLocalFile, getFileUrl } = require('../utils/fileUpload');

/**
 * @desc    Upload product images
 * @route   POST /api/upload/product-images
 * @access  Private/Admin
 */
const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image'
      });
    }

    // Process uploaded files
    const uploadedImages = req.files.map((file) => {
      return {
        filename: file.filename,
        url: `${req.protocol}://${req.get('host')}${getFileUrl(file.filename)}`,
        originalName: file.originalname,
        size: file.size
      };
    });

    res.status(200).json({
      success: true,
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      count: uploadedImages.length,
      images: uploadedImages
    });
  } catch (error) {
    // Clean up any uploaded files if error occurs
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete product image from local storage
 * @route   DELETE /api/upload/product-image
 * @access  Private/Admin
 */
const deleteProductImage = async (req, res, next) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'No image filename provided'
      });
    }

    // Delete from local storage
    const result = await deleteLocalFile(filename);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: 'Image not found or already deleted'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadProductImages,
  deleteProductImage
};
