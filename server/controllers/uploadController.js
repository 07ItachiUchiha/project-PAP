const fs = require('fs');
const path = require('path');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/fileUpload');

/**
 * @desc    Upload product images
 * @route   POST /api/upload/products
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

    const uploadPromises = req.files.map(async (file) => {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(file.path, 'products');
      
      // Delete local file after upload
      fs.unlinkSync(file.path);

      return {
        public_id: result.public_id,
        url: result.secure_url
      };
    });

    // Wait for all uploads to complete
    const uploadedImages = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      count: uploadedImages.length,
      images: uploadedImages
    });
  } catch (error) {
    // Clean up any local files if error occurs
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
 * @desc    Delete product image from Cloudinary
 * @route   DELETE /api/upload/products/:public_id
 * @access  Private/Admin
 */
const deleteProductImage = async (req, res, next) => {
  try {
    const { public_id } = req.params;
    
    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: 'No image public_id provided'
      });
    }

    // Delete from cloudinary
    const result = await deleteFromCloudinary(public_id);

    if (result.result !== 'ok') {
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
