import React, { useState, useEffect } from 'react';
import { FiTag, FiX, FiPercent, FiDollarSign, FiTruck, FiGift } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CouponInput = ({ 
  appliedCoupons = [], 
  availableCoupons = [], 
  isLoading = false, 
  onApplyCoupon, 
  onRemoveCoupon, 
  onLoadCoupons 
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);  // Track if coupons have been loaded to prevent infinite loops
  const [couponsLoaded, setCouponsLoaded] = useState(false);

  useEffect(() => {
    // Only load coupons once when component mounts and haven't been loaded yet
    if (onLoadCoupons && !couponsLoaded && availableCoupons.length === 0 && !isLoading) {
      const timer = setTimeout(() => {
        onLoadCoupons();
        setCouponsLoaded(true);
      }, 200); // Increased delay to prevent rapid calls
      
      return () => clearTimeout(timer);
    }
    
    // Mark as loaded if coupons exist
    if (availableCoupons.length > 0) {
      setCouponsLoaded(true);
    }
  }, [onLoadCoupons, availableCoupons.length, isLoading, couponsLoaded]);

  const handleApplyCoupon = async (code = couponCode) => {
    if (!code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    if (onApplyCoupon) {
      onApplyCoupon(code.trim());
      setCouponCode('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveCoupon = async (couponId) => {
    if (onRemoveCoupon) {
      onRemoveCoupon(couponId);
    }
  };

  const getCouponIcon = (type) => {
    switch (type) {
      case 'percentage': return <FiPercent className="w-4 h-4" />;
      case 'fixed': return <FiDollarSign className="w-4 h-4" />;
      case 'free_shipping': return <FiTruck className="w-4 h-4" />;
      case 'buy_x_get_y': return <FiGift className="w-4 h-4" />;
      default: return <FiTag className="w-4 h-4" />;
    }
  };

  const formatDiscount = (coupon) => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}% OFF`;
      case 'fixed':
        return `$${coupon.value} OFF`;
      case 'free_shipping':
        return 'FREE SHIPPING';
      case 'buy_x_get_y':
        return `Buy ${coupon.buyXGetY?.buyQuantity} Get ${coupon.buyXGetY?.getQuantity}`;
      default:
        return 'DISCOUNT';
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
        <FiTag className="w-5 h-5 mr-2 text-green-600" />
        Promo Code
      </h3>      {/* Applied Coupons */}
      {appliedCoupons && appliedCoupons.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Applied Coupons:</h4>
          <div className="space-y-2">
            {appliedCoupons.map((appliedCoupon) => (
              <div key={appliedCoupon.couponId} className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-green-700">
                    {getCouponIcon(appliedCoupon.discountType)}
                    <span className="font-mono font-bold">{appliedCoupon.couponCode}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 font-semibold">
                    -${appliedCoupon.discountAmount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleRemoveCoupon(appliedCoupon.couponId)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                    title="Remove coupon"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}      {/* Coupon Input */}
      <div className="relative">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Enter coupon code"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase font-mono"
              disabled={isLoading}
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && availableCoupons.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500">Available Coupons</p>
                </div>
                {isLoading ? (
                  <div className="p-3 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mx-auto"></div>
                  </div>
                ) : (
                  availableCoupons.map((coupon) => (
                    <button
                      key={coupon._id}
                      onClick={() => {
                        setCouponCode(coupon.code);
                        setShowSuggestions(false);
                        handleApplyCoupon(coupon.code);
                      }}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 text-green-600">
                            {getCouponIcon(coupon.type)}
                            <span className="font-mono font-bold text-sm">{coupon.code}</span>
                          </div>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {formatDiscount(coupon)}
                          </span>
                        </div>
                        <span className="text-green-600 font-semibold text-sm">
                          Save ${coupon.potentialDiscount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>
                      {coupon.minOrderValue > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          Min. order: ${coupon.minOrderValue}
                        </p>
                      )}
                    </button>
                  ))
                )}
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="w-full p-2 text-center text-xs text-gray-500 hover:bg-gray-50 border-t border-gray-100"
                >
                  Close suggestions
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => handleApplyCoupon()}
            disabled={isLoading || !couponCode.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Apply'
            )}
          </button>
        </div>
        
        {/* Click outside to close suggestions */}
        {showSuggestions && (
          <div 
            className="fixed inset-0 z-5"
            onClick={() => setShowSuggestions(false)}
          />
        )}
      </div>

      {/* Available Coupons Preview */}
      {!showSuggestions && availableCoupons.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowSuggestions(true)}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            View {availableCoupons.length} available coupon{availableCoupons.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
};

export default CouponInput;
