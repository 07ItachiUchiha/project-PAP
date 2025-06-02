import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { 
  HeartIcon as HeartOutline, 
  ShoppingCartIcon,
  StarIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { addToCart, addToLocalCart } from '../../store/slices/cartSlice';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isWishlisted, setIsWishlisted] = React.useState(false);

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
      <StarIcon
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
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
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link to={`/product/${product._id}`} className="block">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden">            <img 
              src={product.images?.[0]?.url || product.images?.[0] || '/placeholder-plant.jpg'} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isOnSale && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                  -{discountPercentage}%
                </span>
              )}
              {product.isNew && (
                <span className="px-2 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full">
                  New
                </span>
              )}
              {product.stock < 5 && product.stock > 0 && (
                <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                  Low Stock
                </span>
              )}
              {product.stock === 0 && (
                <span className="px-2 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleWishlist}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
              >
                {isWishlisted ? (
                  <HeartSolid className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartOutline className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>            {/* Quick Add Button - Now visible always with hover effect */}
            <div className="absolute bottom-4 left-4 right-4 transition-all duration-300">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-green-500 text-black py-2 px-4 rounded-full hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                <ShoppingCartIcon className="h-4 w-4" />
                {product.stock === 0 ? 'Out of Stock' : 'Quick Add'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Category */}
            <p className="text-sm text-primary-600 font-medium mb-1">
              {product.category?.name || 'Plants'}
            </p>
            
            {/* Name */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {product.name}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                {renderStars(product.rating || 4.5)}
              </div>
              <span className="text-sm text-gray-600">
                ({product.reviewCount || 12})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-bold text-gray-900">
                ₹{isOnSale ? product.salePrice : product.price}
              </span>
              {isOnSale && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.price}
                </span>
              )}
            </div>

            {/* Care Level */}
            {product.careLevel && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Care Level:</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  product.careLevel === 'Easy' 
                    ? 'bg-green-100 text-green-700'
                    : product.careLevel === 'Medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product.careLevel}
                </span>
              </div>
            )}

            {/* Plant Size */}
            {product.size && (
              <p className="text-sm text-gray-600 mt-2">
                Size: {product.size}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
