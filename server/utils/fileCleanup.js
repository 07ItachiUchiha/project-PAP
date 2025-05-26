const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

/**
 * Clean up orphaned image files that are no longer referenced by any product
 */
async function cleanupOrphanedFiles() {
  try {
    const uploadsDir = path.join(__dirname, '../uploads/products');
    
    // Get all files in uploads directory
    const files = fs.readdirSync(uploadsDir).filter(file => 
      file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.webp')
    );
    
    console.log(`Found ${files.length} image files in uploads directory`);
    
    // Get all products and extract their image filenames
    const products = await Product.find({}, 'images');
    const usedFilenames = new Set();
    
    products.forEach(product => {
      product.images.forEach(image => {
        if (image.filename) {
          usedFilenames.add(image.filename);
        }
      });
    });
    
    console.log(`Found ${usedFilenames.size} files referenced in database`);
    
    // Find orphaned files
    const orphanedFiles = files.filter(filename => !usedFilenames.has(filename));
    
    if (orphanedFiles.length === 0) {
      console.log('No orphaned files found');
      return { deleted: 0, skipped: files.length };
    }
    
    console.log(`Found ${orphanedFiles.length} orphaned files:`);
    orphanedFiles.forEach(file => console.log(`  - ${file}`));
    
    // Delete orphaned files
    let deletedCount = 0;
    for (const filename of orphanedFiles) {
      try {
        const filePath = path.join(uploadsDir, filename);
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`Deleted: ${filename}`);
      } catch (error) {
        console.error(`Failed to delete ${filename}:`, error.message);
      }
    }
    
    console.log(`Cleanup completed: ${deletedCount} files deleted`);
    return { deleted: deletedCount, skipped: files.length - orphanedFiles.length };
    
  } catch (error) {
    console.error('Cleanup failed:', error);
    throw error;
  }
}

/**
 * Get storage statistics
 */
function getStorageStats() {
  try {
    const uploadsDir = path.join(__dirname, '../uploads/products');
    const files = fs.readdirSync(uploadsDir);
    
    let totalSize = 0;
    let imageCount = 0;
    
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
        totalSize += stats.size;
        imageCount++;
      }
    });
    
    return {
      imageCount,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      averageFileSizeMB: imageCount > 0 ? ((totalSize / imageCount) / (1024 * 1024)).toFixed(2) : 0
    };
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    return null;
  }
}

// If run directly
if (require.main === module) {
  const mongoose = require('mongoose');
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log('Connected to MongoDB');
      
      // Show storage stats
      const stats = getStorageStats();
      if (stats) {
        console.log('\n=== Storage Statistics ===');
        console.log(`Images: ${stats.imageCount}`);
        console.log(`Total Size: ${stats.totalSizeMB} MB`);
        console.log(`Average File Size: ${stats.averageFileSizeMB} MB`);
        console.log('========================\n');
      }
      
      // Run cleanup
      await cleanupOrphanedFiles();
      
      process.exit(0);
    })
    .catch(error => {
      console.error('Database connection failed:', error);
      process.exit(1);
    });
}

module.exports = {
  cleanupOrphanedFiles,
  getStorageStats
};
