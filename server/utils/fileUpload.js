const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `product-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// Validate file type
const fileFilter = (req, file, cb) => {
  // Accept image files only
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP image files are allowed!'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  }
});

// Delete local file
const deleteLocalFile = async (filename) => {
  try {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true, message: 'File deleted successfully' };
    } else {
      return { success: false, message: 'File not found' };
    }
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

// Get file URL for serving
const getFileUrl = (filename) => {
  return `/uploads/products/${filename}`;
};

module.exports = {
  upload,
  deleteLocalFile,
  getFileUrl,
  uploadsDir
};
