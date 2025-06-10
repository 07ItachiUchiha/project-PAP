import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Heart, 
  ShoppingCart,
  Star,
  Leaf,
  Eye,
  Sparkles
} from 'lucide-react';
import { addToCart, addToLocalCart } from '../../store/slices/cartSlice';
import { toast } from 'react-toastify';
import OptimizedImage from '../common/OptimizedImage';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  const getProductPlaceholder = (product) => {
    if (product.category?.includes('organic') || product.category?.includes('vegetable')) {
      return '/images/products/placeholder-vegetable.svg';
    } else if (product.category?.includes('tool')) {
      return '/images/products/placeholder-tool.svg';
    } else {
      return '/images/products/placeholder-plant.svg';
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAuthenticated) {
      // For authenticated users, use API-based cart
      try {
        await dispatch(addToCart({
          productId: product._id,
          quantity: 1
        })).unwrap();
        toast.success('Added to cart!');
      } catch (error) {
        toast.error(error || 'Failed to add to cart');
      }
    } else {
      // For guest users, use local cart
      dispatch(addToLocalCart({
        product: product,
        quantity: 1
      }));
      toast.success('Added to cart!');
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating) 
            ? 'text-terracotta-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const isOnSale = product.salePrice && product.salePrice < product.price;
  const discountPercentage = isOnSale 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative"
    >
      <Link to={`/product/${product._id}`} className="block">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft border border-sage-100/50 overflow-hidden hover:shadow-nature transition-all duration-500 relative">
          {/* Decorative corner elements */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-sage-200/30 to-transparent rounded-bl-3xl"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-terracotta-200/20 to-transparent rounded-tr-3xl"></div>
            {/* Image Container */}
          <div className="relative aspect-square overflow-hidden rounded-t-3xl">              <OptimizedImage
              src={product.images?.[0]?.url || product.images?.[0] || getProductPlaceholder(product)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              aspectRatio="square"
              lazy={true}
              fallback={getProductPlaceholder(product)}
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Floating badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isOnSale && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1.5 bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white text-xs font-semibold rounded-full shadow-soft flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  -{discountPercentage}%
                </motion.span>
              )}
              {product.isNew && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-forest-500 to-forest-600 text-white text-xs font-semibold rounded-full shadow-soft flex items-center gap-1">
                  <Leaf className="h-3 w-3" />
                  New
                </span>
              )}
              {product.stock < 5 && product.stock > 0 && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-semibold rounded-full shadow-soft">
                  Low Stock
                </span>
              )}
              {product.stock === 0 && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs font-semibold rounded-full shadow-soft">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWishlist}
                className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-nature hover:shadow-glow transition-all duration-300 border border-white/20"
              >
                <Heart 
                  className={`h-5 w-5 transition-colors duration-300 ${
                    isWishlisted 
                      ? 'text-terracotta-500 fill-current' 
                      : 'text-forest-600 hover:text-terracotta-500'
                  }`} 
                />
              </motion.button>
            </div>

            {/* Quick View Button */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-nature hover:shadow-glow transition-all duration-300 border border-white/20"
              >
                <Eye className="h-5 w-5 text-forest-600 hover:text-sage-600 transition-colors duration-300" />
              </motion.button>
            </div>

            {/* Quick Add Button */}
            <div className="absolute bottom-4 left-4 right-16 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-gradient-to-r from-forest-600 to-forest-700 text-white py-3 px-4 rounded-full hover:from-forest-500 hover:to-forest-600 shadow-nature hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-medium text-sm backdrop-blur-sm"
              >
                <ShoppingCart className="h-4 w-4" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 relative">
            {/* Category with plant icon */}
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="h-4 w-4 text-sage-500" />
              <p className="text-sm text-sage-600 font-medium">
                {product.category?.name || 'Plants'}
              </p>
            </div>
            
            {/* Name */}
            <h3 className="text-lg font-semibold text-charcoal-800 mb-3 line-clamp-2 group-hover:text-forest-700 transition-colors duration-300">
              {product.name}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {renderStars(product.rating || 4.5)}
              </div>
              <span className="text-sm text-charcoal-600">
                ({product.reviewCount || 12} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold text-forest-800">
                ₹{isOnSale ? product.salePrice : product.price}
              </span>
              {isOnSale && (
                <span className="text-base text-charcoal-500 line-through">
                  ₹{product.price}
                </span>
              )}
            </div>

            {/* Care Level */}
            {product.careLevel && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-charcoal-600">Care Level:</span>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                  product.careLevel === 'Easy' 
                    ? 'bg-sage-100 text-sage-700 border border-sage-200'
                    : product.careLevel === 'Medium'
                    ? 'bg-terracotta-100 text-terracotta-700 border border-terracotta-200'
                    : 'bg-forest-100 text-forest-700 border border-forest-200'
                }`}>
                  {product.careLevel}
                </span>
              </div>
            )}

            {/* Plant Size */}
            {product.size && (
              <p className="text-sm text-charcoal-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-sage-400 rounded-full"></span>
                Size: {product.size}
              </p>
            )}

            {/* Decorative bottom accent */}
            <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-sage-200 to-transparent"></div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
