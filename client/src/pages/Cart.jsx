import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  ShoppingBag,
  Leaf,
  Sparkles,
  Heart,
  TreePine,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Gift
} from 'lucide-react';
import { 
  fetchCart, 
  updateCartItem, 
  removeFromCart, 
  updateLocalCartItem, 
  removeFromLocalCart,
  fetchAvailableCoupons,
  applyCoupon,
  removeCoupon
} from '../store/slices/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CouponInput from '../components/cart/CouponInput';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    items, 
    totalAmount, 
    totalQuantity, 
    subtotal,
    totalDiscount,
    finalAmount,
    appliedCoupons,
    availableCoupons,
    isLoading,
    couponLoading
  } = useSelector(state => state.cart);
  const { isAuthenticated } = useSelector(state => state.auth);
  const [cartUpdating, setCartUpdating] = useState(false);
  // Track if coupons have been loaded to prevent duplicate API calls
  const [couponsInitialized, setCouponsInitialized] = useState(false);

  // Memoize the onLoadCoupons function to prevent unnecessary re-renders
  const handleLoadCoupons = useCallback(() => {
    if (isAuthenticated && !couponsInitialized && availableCoupons.length === 0 && !couponLoading) {
      dispatch(fetchAvailableCoupons());
      setCouponsInitialized(true);
    }
  }, [dispatch, isAuthenticated, couponsInitialized, availableCoupons.length, couponLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      // Only fetch coupons if not already initialized
      if (!couponsInitialized && availableCoupons.length === 0) {
        dispatch(fetchAvailableCoupons());
        setCouponsInitialized(true);
      }
    }
  }, [dispatch, isAuthenticated, couponsInitialized, availableCoupons.length]);

  // Mark coupons as initialized if they exist
  useEffect(() => {
    if (availableCoupons.length > 0) {
      setCouponsInitialized(true);
    }
  }, [availableCoupons.length]);

  const handleQuantityChange = async (productId, quantity) => {
    setCartUpdating(true);
    try {
      if (isAuthenticated) {
        await dispatch(updateCartItem({ productId, quantity })).unwrap();
      } else {
        dispatch(updateLocalCartItem({ productId, quantity }));
      }
    } catch (error) {
      toast.error(error || 'Failed to update cart');
    } finally {
      setCartUpdating(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    setCartUpdating(true);
    try {
      if (isAuthenticated) {
        await dispatch(removeFromCart(productId)).unwrap();
        toast.success('Item removed from cart');
      } else {
        dispatch(removeFromLocalCart(productId));
        toast.success('Item removed from cart');
      }
    } catch (error) {
      toast.error(error || 'Failed to remove item');
    } finally {
      setCartUpdating(false);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.info('Please login to proceed to checkout');
      navigate('/auth/login');
      return;
    }
    navigate('/checkout');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50 relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-20 left-10 w-32 h-32 bg-sage-200/20 rounded-full blur-xl"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-20 right-20 w-40 h-40 bg-terracotta-200/15 rounded-full blur-xl"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          />
        </div>

        <div className="flex items-center justify-center min-h-screen px-4">
          <motion.div 
            className="text-center max-w-lg"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="w-32 h-32 bg-gradient-to-br from-sage-400 to-forest-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-nature"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <ShoppingBag className="h-16 w-16 text-white" />
            </motion.div>
            
            <h1 className="text-4xl font-display font-bold text-charcoal-800 mb-4">
              Your Garden Cart is Empty
            </h1>
            <p className="text-lg text-sage-700 mb-8 leading-relaxed">
              Ready to start your green journey? Discover our beautiful collection of plants 
              and bring nature's magic into your space! 🌿
            </p>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/shop" 
                className="bg-gradient-to-r from-forest-700 to-sage-600 text-white px-8 py-4 rounded-2xl hover:from-forest-600 hover:to-sage-500 transition-all duration-300 font-medium text-lg shadow-nature hover:shadow-glow inline-flex items-center gap-3"
              >
                <TreePine className="h-6 w-6" />
                Explore Plants
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-10 left-10 w-24 h-24 bg-sage-200/20 rounded-full blur-xl"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/3 right-16 w-32 h-32 bg-terracotta-200/15 rounded-full blur-xl"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="relative py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Leaf className="h-8 w-8 text-sage-600 animate-sway" />
              <h1 className="text-4xl font-display font-bold text-charcoal-800">
                Your Garden Cart
              </h1>
              <Sparkles className="h-8 w-8 text-terracotta-500 animate-pulse" />
            </div>
            <p className="text-sage-700 text-lg">
              {totalQuantity} beautiful plant{totalQuantity !== 1 ? 's' : ''} ready to transform your space
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enhanced Cart Items */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft border border-white/20 overflow-hidden">
                <div className="divide-y divide-sage-100">
                  {items.map((item, index) => {
                    // Add null check for product
                    if (!item.product) {
                      return null;
                    }
                    
                    return (
                      <motion.div 
                        key={item._id || item.product._id} 
                        className="p-6 hover:bg-sage-50/50 transition-colors duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-6">
                          {/* Enhanced Product Image */}
                          <div className="relative w-24 h-24 flex-shrink-0">
                            <img 
                              src={item.product.images?.[0]?.url || '/placeholder.jpg'} 
                              alt={item.product.name || 'Product'}
                              className="w-full h-full object-cover rounded-2xl shadow-soft"
                            />
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-terracotta-500 to-terracotta-600 rounded-full flex items-center justify-center">
                              <Heart className="h-3 w-3 text-white fill-current" />
                            </div>
                          </div>
                          
                          {/* Enhanced Product Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold text-charcoal-800 mb-2">
                              {item.product.name || 'Unknown Product'}
                            </h3>
                            <p className="text-sage-600 text-sm line-clamp-2 mb-3">
                              {item.product.shortDescription || item.product.description || 'Beautiful plant to enhance your space'}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-forest-700">
                                ${(item.product.price || 0).toFixed(2)}
                              </span>
                              <span className="text-sage-500 text-sm">per plant</span>
                            </div>
                          </div>
                        
                          {/* Enhanced Quantity Controls */}
                          <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center bg-sage-50 rounded-full p-1 border border-sage-200">
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleQuantityChange(item.product._id, Math.max(1, item.quantity - 1))}
                                className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-sage-600 hover:text-forest-700 transition-colors"
                                disabled={cartUpdating}
                              >
                                <Minus className="h-4 w-4" />
                              </motion.button>
                              <span className="px-4 py-2 font-semibold text-charcoal-800 min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-sage-600 hover:text-forest-700 transition-colors"
                                disabled={cartUpdating || item.quantity >= (item.product.stock || 10)}
                              >
                                <Plus className="h-4 w-4" />
                              </motion.button>
                            </div>
                            
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRemoveItem(item.product._id)}
                              className="flex items-center gap-2 text-terracotta-600 hover:text-terracotta-700 transition-colors text-sm font-medium"
                              disabled={cartUpdating}
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>            {/* Enhanced Order Summary */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft border border-white/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Gift className="h-6 w-6 text-terracotta-500" />
                  <h2 className="text-2xl font-display font-bold text-charcoal-800">
                    Order Summary
                  </h2>
                </div>
                
                {/* Enhanced Coupon Input Section */}
                {isAuthenticated && (
                  <motion.div 
                    className="mb-8 p-4 bg-sage-50/50 rounded-2xl border border-sage-200/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <CouponInput
                      appliedCoupons={appliedCoupons}
                      availableCoupons={availableCoupons}
                      isLoading={couponLoading}
                      onApplyCoupon={(couponCode) => {
                        dispatch(applyCoupon(couponCode))
                          .unwrap()
                          .then(() => {
                            toast.success('Coupon applied successfully!');
                          })
                          .catch((error) => {
                            toast.error(error);
                          });
                      }}
                      onRemoveCoupon={(couponId) => {
                        dispatch(removeCoupon(couponId))
                          .unwrap()
                          .then(() => {
                            toast.success('Coupon removed successfully!');
                          })
                          .catch((error) => {
                            toast.error(error);
                          });
                      }}
                      onLoadCoupons={handleLoadCoupons}
                    />
                  </motion.div>
                )}
                
                {/* Enhanced Price Breakdown */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sage-700">Subtotal ({totalQuantity} items)</span>
                    <span className="font-semibold text-charcoal-800">
                      ${(subtotal || totalAmount).toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Enhanced Discount Display */}
                  {appliedCoupons && appliedCoupons.length > 0 && (
                    <motion.div 
                      className="flex justify-between items-center py-2 text-forest-600"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span>Total Savings</span>
                      </div>
                      <span className="font-semibold">-${totalDiscount.toFixed(2)}</span>
                    </motion.div>
                  )}
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sage-700">Shipping</span>
                    <span className="text-sage-600">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sage-700">Tax</span>
                    <span className="text-sage-600">Calculated at checkout</span>
                  </div>
                  
                  <div className="border-t border-sage-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-display font-bold text-charcoal-800">Total</span>
                      <span className="text-2xl font-bold text-forest-700">
                        ${(finalAmount || totalAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Checkout Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full py-4 bg-gradient-to-r from-forest-700 to-sage-600 text-white rounded-2xl hover:from-forest-600 hover:to-sage-500 font-semibold text-lg shadow-nature hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  disabled={cartUpdating}
                >
                  <ShoppingBag className="h-5 w-5" />
                  {isAuthenticated ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
                
                {/* Enhanced Continue Shopping Link */}
                <motion.div 
                  className="mt-6 text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <Link 
                    to="/shop" 
                    className="text-sage-600 hover:text-forest-700 flex items-center justify-center gap-2 font-medium transition-colors duration-300"
                  >
                    <TreePine className="h-5 w-5" />
                    Continue Shopping
                  </Link>
                </motion.div>
              </div>

              {/* Enhanced Payment Methods Info */}
              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft border border-white/20 p-6 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-5 w-5 text-terracotta-500" />
                  <h3 className="text-lg font-semibold text-charcoal-800">Secure Payment</h3>
                </div>
                <p className="text-sage-600 text-sm mb-4">
                  Your payment information is encrypted and secure
                </p>
                <div className="flex items-center justify-center space-x-4 opacity-70">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">
                    VISA
                  </div>
                  <div className="w-12 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded text-white text-xs flex items-center justify-center font-bold">
                    MC
                  </div>
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    AMEX
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
