import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  EyeIcon, 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from './OptimizedImage';

/**
 * Recently Viewed Products Component
 * Displays a sliding panel of recently viewed products
 */
const RecentlyViewed = ({ className = '' }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load recently viewed items from localStorage
  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem('recentlyViewed');
        if (stored) {
          const items = JSON.parse(stored);
          setRecentlyViewed(items.slice(0, 10)); // Limit to 10 items
        }
      } catch (error) {
        console.error('Error loading recently viewed:', error);
      }
    };

    loadRecentlyViewed();

    // Listen for storage changes (when products are viewed in other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'recentlyViewed') {
        loadRecentlyViewed();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Add product to recently viewed
  const addToRecentlyViewed = (product) => {
    try {
      const existing = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      
      // Remove if already exists to avoid duplicates
      const filtered = existing.filter(item => item._id !== product._id);
      
      // Add to beginning
      const updated = [product, ...filtered].slice(0, 10);
      
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      setRecentlyViewed(updated);
    } catch (error) {
      console.error('Error saving to recently viewed:', error);
    }
  };

  // Remove item from recently viewed
  const removeFromRecentlyViewed = (productId) => {
    try {
      const filtered = recentlyViewed.filter(item => item._id !== productId);
      localStorage.setItem('recentlyViewed', JSON.stringify(filtered));
      setRecentlyViewed(filtered);
    } catch (error) {
      console.error('Error removing from recently viewed:', error);
    }
  };

  // Clear all recently viewed
  const clearRecentlyViewed = () => {
    localStorage.removeItem('recentlyViewed');
    setRecentlyViewed([]);
    setIsExpanded(false);
  };

  // Navigate through items
  const navigateItems = (direction) => {
    const maxIndex = Math.max(0, recentlyViewed.length - 4);
    if (direction === 'next' && currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Expose addToRecentlyViewed globally for use in product pages
  useEffect(() => {
    window.addToRecentlyViewed = addToRecentlyViewed;
    return () => {
      delete window.addToRecentlyViewed;
    };
  }, []);

  // Don't render if no items
  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
      <AnimatePresence>
        {!isExpanded ? (
          // Collapsed state - floating button
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(true)}
            className="bg-sage-600 text-white p-4 rounded-full shadow-lg hover:bg-sage-700 transition-colors group"
          >
            <div className="relative">
              <EyeIcon className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-terracotta-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {recentlyViewed.length}
              </span>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 bg-black text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Recently Viewed ({recentlyViewed.length})
            </div>
          </motion.button>
        ) : (
          // Expanded state - product grid
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-80 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <EyeIcon className="w-5 h-5 mr-2" />
                Recently Viewed
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearRecentlyViewed}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="relative">
              {/* Navigation Arrows */}
              {recentlyViewed.length > 4 && (
                <>
                  <button
                    onClick={() => navigateItems('prev')}
                    disabled={currentIndex === 0}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateItems('next')}
                    disabled={currentIndex >= Math.max(0, recentlyViewed.length - 4)}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Products */}
              <div className="grid grid-cols-2 gap-3 overflow-hidden">
                {recentlyViewed
                  .slice(currentIndex, currentIndex + 4)
                  .map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative"
                    >
                      <Link
                        to={`/product/${product._id}`}
                        className="block bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        onClick={() => setIsExpanded(false)}
                      >
                        <div className="aspect-square relative">
                          <OptimizedImage
                            src={product.image || product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Remove button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeFromRecentlyViewed(product._id);
                            }}
                            className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="p-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </h4>
                          <p className="text-sm text-sage-600 font-semibold">
                            ${product.price}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
              </div>

              {/* View All Link */}
              {recentlyViewed.length > 4 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-sm text-sage-600 hover:text-sage-700 font-medium"
                  >
                    View All ({recentlyViewed.length})
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecentlyViewed;
