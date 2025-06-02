import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { HeartIcon, ShoppingCartIcon, ArrowLeftIcon, CheckIcon, ShieldCheckIcon, TruckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import { addToCart, addToLocalCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { fetchProductById } from '../store/slices/productSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMounted = useRef(false);
  
  // Component state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  
  // Selectors
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  
  // Safe selector that won't cause re-renders with new array references
  const wishlistItems = useSelector(state => {
    return state.wishlist?.items || [];
  });
  
  // Check if product is in wishlist - memoized to prevent recalculations
  const isInWishlist = useMemo(() => {
    if (!wishlistItems?.length || !id) return false;
    return wishlistItems.some(item => item._id === id);
  }, [wishlistItems, id]);
  
  // Fetch product details on mount
  useEffect(() => {
    const getProductData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const resultAction = await dispatch(fetchProductById(id));
        
        // Only update state if still mounted
        if (!isMounted.current) return;
        
        if (fetchProductById.fulfilled.match(resultAction)) {
          setProduct(resultAction.payload.product);
        } else {
          const errorMsg = resultAction.error?.message || 'Failed to load product details';
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (error) {
        if (!isMounted.current) return;
        const errorMsg = error.message || 'Failed to load product details';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    
    isMounted.current = true;
    getProductData();
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [id, dispatch]);
  
  // Update wishlist status separately to avoid dependency cycles
  useEffect(() => {
    if (isMounted.current) {
      setInWishlist(isInWishlist);
    }
  }, [isInWishlist]);
  
  // Quantity handlers
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 10)) {
      setQuantity(value);
    }
  };
  
  const increaseQuantity = () => {
    if (quantity < (product?.stock || 10)) {
      setQuantity(quantity + 1);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // Cart handler - supports both guest and authenticated users
  const handleAddToCart = async () => {
    if (!product) return;
    
    if (isAuthenticated) {
      // API-based cart for authenticated users
      try {
        await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
        toast.success(`${product.name} added to cart!`);
      } catch (error) {
        toast.error(error || 'Failed to add to cart');
      }
    } else {
      // Local cart for guest users
      dispatch(addToLocalCart({ product: product, quantity }));
      toast.success(`${product.name} added to cart!`);
    }
  };
  
  // Wishlist toggle handler
  const toggleWishlist = () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      toast.info('Please login to add items to wishlist');
      navigate('/login');
      return;
    }
    
    if (inWishlist) {
      dispatch(removeFromWishlist(product._id))
        .unwrap()
        .then(() => {
          setInWishlist(false);
          toast.success(`${product.name} removed from wishlist!`);
        })
        .catch(error => {
          toast.error(error || 'Failed to remove from wishlist');
        });
    } else {
      dispatch(addToWishlist(product._id))
        .unwrap()
        .then(() => {
          setInWishlist(true);
          toast.success(`${product.name} added to wishlist!`);
        })
        .catch(error => {
          toast.error(error || 'Failed to add to wishlist');
        });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-red-600 mb-6">{error || 'Product not available'}</p>
          <Link to="/shop" className="text-primary-600 hover:text-primary-700 flex items-center justify-center">
            <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            </li>
            <li className="text-gray-500">/</li>
            <li>
              <Link to="/shop" className="text-gray-500 hover:text-gray-700">Shop</Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-medium truncate">{product.name}</li>
          </ol>
        </nav>
        
        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Product Images */}
            <div className="md:w-1/2 p-6">
              <div className="relative h-96 rounded-lg overflow-hidden mb-4">                <img 
                  src={product.images && product.images.length > 0 
                    ? (product.images[selectedImage]?.url || product.images[selectedImage])
                    : 'https://via.placeholder.com/600x600'
                  } 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <div 
                      key={index}
                      className={`w-20 h-20 rounded cursor-pointer border-2 ${
                        selectedImage === index ? 'border-primary-500' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >                      <img 
                        src={image?.url || image} 
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="md:w-1/2 p-6 md:border-l border-gray-200">
              {/* Product Category & Name */}
              <div className="mb-4">
                <div className="inline-block px-2 py-1 rounded bg-primary-100 text-primary-800 text-xs font-medium mb-2">
                  {product.category || 'Plant'}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              </div>
              
              {/* Price */}
              <div className="flex items-center mb-6">
                <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="ml-3 text-lg text-gray-500 line-through">₹{product.originalPrice}</span>
                )}
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="ml-3 bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>
              
              {/* Ratings */}
              <div className="flex items-center mb-6">
                <div className="flex">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon
                      key={rating}
                      className={`h-5 w-5 ${
                        (product.ratings && product.ratings.average) > rating
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  {product.ratings ? `${product.ratings.average} (${product.ratings.count} reviews)` : 'No reviews yet'}
                </span>
              </div>
              
              {/* Description */}
              <div className="mb-6 prose">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{product.description}</p>
              </div>
              
              {/* Stock Status */}
              <div className="mb-6">
                <div className="flex items-center">                  
                  {product.stock > 0 ? (
                    <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <XMarkIcon className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    {product.stock > 0 && ` (${product.stock} available)`}
                  </span>
                </div>
              </div>
              
              {/* Quantity */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Quantity</h3>
                <div className="flex items-center">
                  <button 
                    onClick={decreaseQuantity}
                    className="w-10 h-10 rounded-l border border-gray-300 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock || 10}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 h-10 border-t border-b border-gray-300 text-center [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button 
                    onClick={increaseQuantity}
                    className="w-10 h-10 rounded-r border border-gray-300 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100"
                    disabled={quantity >= (product.stock || 10)}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 mb-6">                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={!product.stock || product.stock <= 0}
                  className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium ${
                    product.stock > 0
                      ? 'bg-green-500 text-black hover:bg-green-600 hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Add to Cart
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleWishlist}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  {inWishlist ? (
                    <HeartSolid className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                </motion.button>
              </div>
              
              {/* Product Info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Shipping */}
                  <div className="flex items-start">
                    <TruckIcon className="h-5 w-5 text-gray-600 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Free Shipping</p>
                      <p className="text-gray-600 text-sm">Delivery in 5-7 working days</p>
                    </div>
                  </div>
                  
                  {/* Returns */}
                  <div className="flex items-start">
                    <ShieldCheckIcon className="h-5 w-5 text-gray-600 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">7-Day Returns</p>
                      <p className="text-gray-600 text-sm">Shop with confidence</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Care Instructions (if plant) */}
              {product.careInstructions && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Care Instructions</h3>
                  <p className="text-gray-700">{product.careInstructions}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {product.sunlightRequirement && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Sunlight</h4>
                        <p className="text-gray-600">{product.sunlightRequirement}</p>
                      </div>
                    )}
                    
                    {product.wateringFrequency && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Watering</h4>
                        <p className="text-gray-600">{product.wateringFrequency}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;