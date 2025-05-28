import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import RazorpayPayment from '../components/payment/RazorpayPayment';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { createOrder, orderAPI } from '../api/orderAPI';
import { clearCart } from '../store/slices/cartSlice';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, totalAmount } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'cod'
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'IN' // Changed to India since using Razorpay
  });

  useEffect(() => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/auth/login');
      return;
    }

    if (!items || items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }
  }, [user, items, navigate]);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        shippingAddress: shippingInfo,
        totalAmount,
        paymentMethod // Include the payment method in order data
      };

      const response = await createOrder(orderData);
      setCurrentOrder(response.data);
      
      // If COD, complete the order immediately without payment processing
      if (paymentMethod === 'cod') {
        handleCodPayment(response.data);
      } else {
        toast.success('Order created successfully! Please complete payment.');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleCodPayment = async (order) => {
    try {
      // Update the order status to "Processing" since payment will be collected on delivery
      await orderAPI.updateOrderStatus(order._id, 'Processing');
      toast.success('Order placed successfully! Payment will be collected upon delivery.');
      dispatch(clearCart());
      navigate('/orders');
    } catch (error) {
      console.error('Error processing COD order:', error);
      toast.error(error.message || 'Failed to process your Cash on Delivery order');
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('Payment completed successfully!');
    dispatch(clearCart());
    navigate('/orders');
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    toast.error(error || 'Payment failed');
  };

  if (!user || !items || items.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Order Summary */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product._id} className="flex items-center space-x-4">
                      <img
                        src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>                      <span className="text-sm font-medium text-gray-900">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-4">                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total: </span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={shippingInfo.firstName}
                    onChange={handleShippingChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={shippingInfo.lastName}
                    onChange={handleShippingChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={shippingInfo.email}
                    onChange={handleShippingChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={shippingInfo.phone}
                    onChange={handleShippingChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    className="md:col-span-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={shippingInfo.state}
                    onChange={handleShippingChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={shippingInfo.zipCode}
                    onChange={handleShippingChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-6">
              {!currentOrder ? (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
                  
                  <div className="space-y-3 mb-6">                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="card-payment"
                        name="payment-method"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="card-payment" className="text-sm text-gray-700 flex items-center">
                        <span>Online Payment (Razorpay)</span>
                        <div className="flex items-center ml-2 space-x-1">
                          <span className="text-xs text-gray-500">UPI, Cards, Net Banking</span>
                        </div>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="cod-payment"
                        name="payment-method"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="cod-payment" className="text-sm text-gray-700">
                        <span>Cash on Delivery</span>
                        <p className="text-xs text-gray-500 mt-1">
                          Pay with cash when your order is delivered.
                        </p>
                      </label>
                    </div>
                  </div>
                    <button
                    onClick={handleCreateOrder}
                    disabled={loading || !shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.address}
                    className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (Cash on Delivery)' : 'Continue to Razorpay Payment'}
                  </button>
                </div>
              ) : (
                <div>                  {paymentMethod === 'card' ? (
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Payment</h2>
                      <RazorpayPayment
                        orderId={currentOrder._id}
                        amount={totalAmount}
                        customerName={`${shippingInfo.firstName} ${shippingInfo.lastName}`}
                        customerEmail={shippingInfo.email}
                        onSuccess={handlePaymentSuccess}
                        onFailure={handlePaymentError}
                      />
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
