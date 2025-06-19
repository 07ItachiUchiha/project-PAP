import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import RazorpayPayment from '../components/payment/RazorpayPayment';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { createOrder } from '../api/orderAPI';
import { clearCart } from '../store/slices/cartSlice';
import { useCurrency } from '../contexts/CurrencyContext';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();
  const { 
    items, 
    totalAmount,
    subtotal,
    totalDiscount,
    finalAmount,
    appliedCoupons
  } = useSelector(state => state.cart);
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
  const validateForm = () => {
    const required = ['firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zipCode'];
    
    // Check if all fields are filled
    if (!required.every(field => shippingInfo[field]?.trim() !== '')) {
      return false;
    }
    
    // Validate phone number (10 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(shippingInfo.phone)) {
      return false;
    }
    
    // Validate postal code (5-6 digits)
    const postalCodeRegex = /^[0-9]{5,6}$/;
    if (!postalCodeRegex.test(shippingInfo.zipCode)) {
      return false;
    }
    
    return true;
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      // Calculate prices
      const itemsPrice = subtotal || totalAmount;
      const discountPrice = totalDiscount || 0;
      const taxPrice = 0; // You can add tax calculation logic here
      const shippingPrice = 0; // You can add shipping calculation logic here
      const totalPrice = (finalAmount || totalAmount) + taxPrice + shippingPrice;

      const orderData = {
        orderItems: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        shippingAddress: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          phone: shippingInfo.phone,
          address: shippingInfo.address, // Changed from 'street' to 'address' to match validation
          city: shippingInfo.city,
          state: shippingInfo.state,
          postalCode: shippingInfo.zipCode, // Changed from 'zipCode' to 'postalCode' to match validation
          country: shippingInfo.country
        },
        paymentMethod: paymentMethod, // Backend expects this as a direct field
        itemsPrice,
        discountPrice,
        appliedCoupons: appliedCoupons || [],
        taxPrice,
        shippingPrice,
        totalPrice
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
  const handleCodPayment = async () => {
    try {
      // For COD orders, the payment status is already set to 'pending' by the server
      // No need to update order status here as it's already set to 'processing' by default
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

  const getFieldValidationClass = (fieldName) => {
    if (!shippingInfo[fieldName]) return "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500";
    
    let isValid = true;
    if (fieldName === 'phone') {
      isValid = /^[6-9]\d{9}$/.test(shippingInfo.phone);
    } else if (fieldName === 'zipCode') {
      isValid = /^[0-9]{5,6}$/.test(shippingInfo.zipCode);
    } else {
      isValid = shippingInfo[fieldName].trim() !== '';
    }
    
    return `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
      isValid 
        ? 'border-gray-300 focus:ring-green-500' 
        : 'border-red-300 focus:ring-red-500'
    }`;
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
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>{formatPrice(subtotal || totalAmount)}</span>
                    </div>
                    
                    {/* Show applied coupons and discounts */}
                    {appliedCoupons && appliedCoupons.length > 0 && (
                      <>
                        <div className="text-sm text-green-600 font-medium">Applied Coupons:</div>
                        {appliedCoupons.map((coupon, index) => (
                          <div key={index} className="flex justify-between text-sm text-green-600">
                            <span>{coupon.couponCode}</span>
                            <span>-{formatPrice(coupon.discountAmount)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-green-600 font-medium">
                          <span>Total Discount:</span>
                          <span>-{formatPrice(totalDiscount)}</span>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span>Free</span>
                    </div>                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span>{formatPrice(0)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span>{formatPrice(finalAmount || totalAmount)}</span>
                      </div>
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
                    className={getFieldValidationClass('firstName')}
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={shippingInfo.lastName}
                    onChange={handleShippingChange}
                    className={getFieldValidationClass('lastName')}
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={shippingInfo.email}
                    onChange={handleShippingChange}
                    className={getFieldValidationClass('email')}
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={shippingInfo.phone}
                    onChange={handleShippingChange}
                    className={getFieldValidationClass('phone')}
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
                    className={getFieldValidationClass('city')}
                    required
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={shippingInfo.state}
                    onChange={handleShippingChange}
                    className={getFieldValidationClass('state')}
                    required
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={shippingInfo.zipCode}
                    onChange={handleShippingChange}
                    className={getFieldValidationClass('zipCode')}
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
                  </div>                  <button
                    onClick={handleCreateOrder}
                    disabled={loading || !validateForm()}
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
