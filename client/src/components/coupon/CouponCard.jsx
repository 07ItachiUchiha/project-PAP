import React, { useState } from 'react';
import { 
  FiCopy, 
  FiCheck, 
  FiCalendar, 
  FiTag, 
  FiInfo,
  FiPercent,
  FiDollarSign,
  FiTruck,
  FiGift
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { formatCouponForDisplay } from '../../api/couponAPI';

const CouponCard = ({ 
  coupon, 
  onApply, 
  onCopy, 
  isApplied = false, 
  isApplicable = true,
  showApplyButton = true,
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);

  const formattedCoupon = formatCouponForDisplay(coupon);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      toast.success('Coupon code copied!');
      
      if (onCopy) {
        onCopy(coupon.code);
      }
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(`Failed to copy coupon code: ${error.message || 'Unknown error'}`);
    }
  };

  const handleApply = async () => {
    if (!onApply || applying) return;
    
    setApplying(true);
    try {
      await onApply(coupon);
    } catch (error) {
      toast.error(error.message || 'Failed to apply coupon');
    } finally {
      setApplying(false);
    }
  };

  const getCouponIcon = () => {
    switch (coupon.type) {
      case 'percentage':
        return <FiPercent className="w-5 h-5" />;
      case 'fixed':
        return <FiDollarSign className="w-5 h-5" />;
      case 'free_shipping':
        return <FiTruck className="w-5 h-5" />;
      case 'buy_x_get_y':
        return <FiGift className="w-5 h-5" />;
      default:
        return <FiTag className="w-5 h-5" />;
    }
  };

  const getCouponTypeText = () => {
    switch (coupon.type) {
      case 'percentage':
        return 'Percentage Discount';
      case 'fixed':
        return 'Fixed Amount Discount';
      case 'free_shipping':
        return 'Free Shipping';
      case 'buy_x_get_y':
        return 'Buy X Get Y';
      default:
        return 'Discount';
    }
  };

  const isExpiringSoon = formattedCoupon.remainingDays <= 3 && formattedCoupon.remainingDays > 0;
  const isExpired = formattedCoupon.remainingDays <= 0;

  return (
    <div className={`
      bg-white rounded-lg border-2 border-dashed transition-all duration-200
      ${isApplied ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400'}
      ${!isApplicable && !isApplied ? 'opacity-50' : ''}
      ${className}
    `}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`
              p-2 rounded-lg
              ${isApplied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}
            `}>
              {getCouponIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{coupon.name}</h3>
              <p className="text-sm text-gray-500">{getCouponTypeText()}</p>
            </div>
          </div>
          
          {/* Status badge */}
          {isExpired ? (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
              Expired
            </span>
          ) : isExpiringSoon ? (
            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
              Expires Soon
            </span>
          ) : isApplied ? (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              Applied
            </span>
          ) : null}
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-lg font-bold text-gray-900 mb-1">
            {formattedCoupon.displayDescription}
          </p>
          {coupon.description && (
            <p className="text-sm text-gray-600">{coupon.description}</p>
          )}
        </div>

        {/* Minimum order and other details */}
        {(coupon.minOrderValue > 0 || coupon.firstTimeOnly) && (
          <div className="mb-4">
            <div className="flex items-start space-x-2 text-sm text-gray-600">
              <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                {coupon.minOrderValue > 0 && (
                  <p>Minimum order: ${coupon.minOrderValue}</p>
                )}
                {coupon.firstTimeOnly && (
                  <p>Valid for first-time customers only</p>
                )}
                {coupon.usageLimit.perUser > 1 && (
                  <p>Can be used {coupon.usageLimit.perUser} times per customer</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Validity period */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <FiCalendar className="w-4 h-4" />
          <span>
            Valid until {formattedCoupon.formattedValidTo}
            {formattedCoupon.remainingDays > 0 && (
              <span className="ml-1">
                ({formattedCoupon.remainingDays} day{formattedCoupon.remainingDays !== 1 ? 's' : ''} left)
              </span>
            )}
          </span>
        </div>

        {/* Coupon code and actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="px-3 py-2 bg-gray-100 rounded-lg font-mono text-sm font-semibold text-gray-900">
              {coupon.code}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              disabled={copied}
            >
              {copied ? (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <FiCopy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {showApplyButton && !isExpired && (
            <button
              onClick={handleApply}
              disabled={!isApplicable || isApplied || applying}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isApplied 
                  ? 'bg-green-100 text-green-800 cursor-default' 
                  : isApplicable
                    ? 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {applying ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Applying...</span>
                </div>
              ) : isApplied ? (
                'Applied'
              ) : (
                'Apply'
              )}
            </button>
          )}
        </div>

        {/* Usage information for admin */}
        {coupon.usageCount && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                Used: {coupon.usageCount.total}
                {coupon.usageLimit.total && ` / ${coupon.usageLimit.total}`}
              </span>
              {coupon.remainingUses !== null && (
                <span>{coupon.remainingUses} remaining</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponCard;
