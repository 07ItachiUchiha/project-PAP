import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  X,
  Scale,
  Star,
  Check,
  ShoppingCart,
  Heart,
  ExternalLink
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import OptimizedImage from './OptimizedImage';
import { useToast } from './ToastProvider';

/**
 * Product Comparison Component
 * Allows users to compare multiple products side by side
 */
const ProductComparison = ({ className = '' }) => {
  const [compareItems, setCompareItems] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { wishlistItems } = useSelector(state => state.wishlist);

  // Load comparison items from localStorage
  useEffect(() => {
    const loadCompareItems = () => {
      try {
        const stored = localStorage.getItem('compareItems');
        if (stored) {
          const items = JSON.parse(stored);
          setCompareItems(items.slice(0, 4)); // Limit to 4 items
        }
      } catch (error) {
        console.error('Error loading compare items:', error);
      }
    };

    loadCompareItems();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'compareItems') {
        loadCompareItems();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Add product to comparison
  const addToCompare = (product) => {
    try {
      const existing = JSON.parse(localStorage.getItem('compareItems') || '[]');
      
      // Check if already exists
      if (existing.some(item => item._id === product._id)) {
        showToast('Product already in comparison', 'info');
        return;
      }

      // Limit to 4 items
      if (existing.length >= 4) {
        showToast('You can only compare up to 4 products', 'warning');
        return;
      }

      const updated = [...existing, product];
      localStorage.setItem('compareItems', JSON.stringify(updated));
      setCompareItems(updated);
      showToast('Product added to comparison', 'success');
    } catch (error) {
      console.error('Error adding to compare:', error);
      showToast('Error adding to comparison', 'error');
    }
  };

  // Remove item from comparison
  const removeFromCompare = (productId) => {
    try {
      const filtered = compareItems.filter(item => item._id !== productId);
      localStorage.setItem('compareItems', JSON.stringify(filtered));
      setCompareItems(filtered);
      showToast('Product removed from comparison', 'success');
    } catch (error) {
      console.error('Error removing from compare:', error);
    }
  };

  // Clear all comparison items
  const clearComparison = () => {
    localStorage.removeItem('compareItems');
    setCompareItems([]);
    setIsExpanded(false);
    showToast('Comparison cleared', 'success');
  };

  // Add to cart handler
  const handleAddToCart = async (product) => {
    setIsLoading(true);
    try {
      await dispatch(addToCart({
        productId: product._id,
        quantity: 1
      })).unwrap();
      showToast('Added to cart successfully', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Error adding to cart', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Wishlist toggle handler
  const handleWishlistToggle = (product) => {
    const isInWishlist = wishlistItems.some(item => item._id === product._id);
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
      showToast('Removed from wishlist', 'success');
    } else {
      dispatch(addToWishlist(product));
      showToast('Added to wishlist', 'success');
    }
  };

  // Expose addToCompare globally for use in product components
  useEffect(() => {
    window.addToCompare = addToCompare;
    return () => {
      delete window.addToCompare;
    };
  }, []);

  // Don't render if no items
  if (compareItems.length === 0) {
    return null;
  }

  // Comparison features to display
  const comparisonFeatures = [
    { key: 'price', label: 'Price', type: 'currency' },
    { key: 'rating', label: 'Rating', type: 'rating' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'difficulty', label: 'Care Level', type: 'text' },
    { key: 'light', label: 'Light Needs', type: 'text' },
    { key: 'wateringFrequency', label: 'Watering', type: 'text' },
    { key: 'mature_size', label: 'Mature Size', type: 'text' },
    { key: 'isOrganic', label: 'Organic', type: 'boolean' },
    { key: 'inStock', label: 'In Stock', type: 'boolean' }
  ];

  const formatValue = (value, type) => {
    switch (type) {
      case 'currency':
        return `$${value || '0'}`;
      case 'rating':
        return (
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(value || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-1 text-sm text-gray-600">
              ({value?.toFixed(1) || '0'})
            </span>
          </div>
        );
      case 'boolean':
        return value ? (
          <CheckIcon className="w-5 h-5 text-green-500" />
        ) : (
          <XIcon className="w-5 h-5 text-red-500" />
        );
      default:
        return value || 'N/A';
    }
  };

  return (
    <div className={`fixed bottom-4 left-4 z-40 ${className}`}>
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
            className="bg-terracotta-600 text-white p-4 rounded-full shadow-lg hover:bg-terracotta-700 transition-colors group"
          >
            <div className="relative">
              <ScaleIcon className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-sage-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {compareItems.length}
              </span>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Compare Products ({compareItems.length})
            </div>
          </motion.button>
        ) : (
          // Expanded state - comparison table
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-6xl w-screen max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <ScaleIcon className="w-6 h-6 mr-2" />
                Product Comparison
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearComparison}
                  className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Comparison Content */}
            <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900 min-w-[150px]">
                      Feature
                    </th>
                    {compareItems.map((product) => (
                      <th key={product._id} className="text-center p-4 min-w-[250px]">
                        <div className="space-y-3">
                          {/* Product Image */}
                          <div className="relative">
                            <OptimizedImage
                              src={product.image || product.images?.[0]}
                              alt={product.name}
                              className="w-20 h-20 object-cover rounded-lg mx-auto"
                            />
                            <button
                              onClick={() => removeFromCompare(product._id)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Product Name */}
                          <div>
                            <Link
                              to={`/product/${product._id}`}
                              className="font-medium text-gray-900 hover:text-sage-600 transition-colors line-clamp-2"
                              onClick={() => setIsExpanded(false)}
                            >
                              {product.name}
                            </Link>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2 justify-center">
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={isLoading || !product.inStock}
                              className="flex-1 bg-sage-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                              <ShoppingCartIcon className="w-4 h-4 mr-1" />
                              Add
                            </button>
                            <button
                              onClick={() => handleWishlistToggle(product)}
                              className={`p-2 rounded-lg border-2 transition-colors ${
                                wishlistItems.some(item => item._id === product._id)
                                  ? 'border-red-500 bg-red-50 text-red-600'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {wishlistItems.some(item => item._id === product._id) ? (
                                <HeartSolid className="w-4 h-4" />
                              ) : (
                                <HeartIcon className="w-4 h-4" />
                              )}
                            </button>
                            <Link
                              to={`/product/${product._id}`}
                              onClick={() => setIsExpanded(false)}
                              className="p-2 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                            >
                              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr
                      key={feature.key}
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="p-4 font-medium text-gray-900 border-r border-gray-200">
                        {feature.label}
                      </td>
                      {compareItems.map((product) => (
                        <td key={product._id} className="p-4 text-center">
                          {formatValue(product[feature.key], feature.type)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductComparison;
