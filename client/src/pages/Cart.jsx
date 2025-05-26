import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  fetchCart, 
  updateCartItem, 
  removeFromCart, 
  updateLocalCartItem, 
  removeFromLocalCart 
} from '../store/slices/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount, totalQuantity, isLoading } = useSelector(state => state.cart);
  const { isAuthenticated } = useSelector(state => state.auth);
  const [cartUpdating, setCartUpdating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Looks like you haven't added any plants to your cart yet!</p>
          <Link to="/shop" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item._id || item.product._id} className="p-6">
                    <div className="flex items-center flex-wrap sm:flex-nowrap gap-4">
                      <div className="w-full sm:w-24 h-24 flex-shrink-0">
                        <img 
                          src={item.product.images?.[0]?.url || '/placeholder.jpg'} 
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{item.product.name}</h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.product.shortDescription || item.product.description}</p>
                        <p className="mt-1 text-lg font-semibold text-green-600">${item.product.price.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button 
                            onClick={() => handleQuantityChange(item.product._id, Math.max(1, item.quantity - 1))}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={cartUpdating}
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border-x border-gray-300">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={cartUpdating || item.quantity >= (item.product.stock || 10)}
                          >
                            +
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => handleRemoveItem(item.product._id)}
                          className="text-red-600 hover:text-red-800 transition"
                          disabled={cartUpdating}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalQuantity} items)</span>
                  <span className="font-medium">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
                disabled={cartUpdating}
              >
                {isAuthenticated ? 'Proceed to Checkout' : 'Sign in to Checkout'}
              </button>
              
              <div className="mt-4">
                <Link to="/shop" className="text-green-600 hover:text-green-800 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Payment Methods Info */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Methods</h3>
              <div className="flex items-center space-x-4">
                <img src="/assets/visa.svg" alt="Visa" className="h-8" />
                <img src="/assets/mastercard.svg" alt="Mastercard" className="h-8" />
                <img src="/assets/amex.svg" alt="American Express" className="h-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
