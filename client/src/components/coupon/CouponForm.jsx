import React, { useState, useEffect } from 'react';
import { FiSave, FiX, FiInfo, FiPlus, FiMinus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { createCoupon, updateCoupon } from '../../api/couponAPI';

const CouponForm = ({ coupon = null, onSuccess, onCancel, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    maxDiscount: '',
    minOrderValue: '',
    usageLimit: {
      total: '',
      perUser: 1
    },
    validFrom: '',
    validTo: '',
    applicableProducts: {
      type: 'all',
      categories: [],
      products: [],
      excludedProducts: []
    },
    buyXGetY: {
      buyQuantity: 1,
      getQuantity: 1,
      maxSets: 1
    },
    isActive: true,
    isAutomatic: false,
    stackable: false,
    firstTimeOnly: false,
    tags: [],
    internalNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');

  const categories = [
    'plants',
    'tools',
    'organic-supplies',
    'organic-vegetables',
    'gifts',
    'accessories'
  ];

  useEffect(() => {
    if (coupon) {
      setFormData({
        ...coupon,
        validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 16) : '',
        validTo: coupon.validTo ? new Date(coupon.validTo).toISOString().slice(0, 16) : '',
        value: coupon.value?.toString() || '',
        maxDiscount: coupon.maxDiscount?.toString() || '',
        minOrderValue: coupon.minOrderValue?.toString() || '',
        usageLimit: {
          total: coupon.usageLimit?.total?.toString() || '',
          perUser: coupon.usageLimit?.perUser || 1
        }
      });
    } else {
      // Set default dates for new coupons
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      setFormData(prev => ({
        ...prev,
        validFrom: now.toISOString().slice(0, 16),
        validTo: nextWeek.toISOString().slice(0, 16)
      }));
    }
  }, [coupon]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.code.trim()) newErrors.code = 'Coupon code is required';
    if (!formData.name.trim()) newErrors.name = 'Coupon name is required';
    if (!formData.value || formData.value <= 0) newErrors.value = 'Valid value is required';
    if (!formData.validFrom) newErrors.validFrom = 'Valid from date is required';
    if (!formData.validTo) newErrors.validTo = 'Valid to date is required';

    // Code format validation
    if (formData.code && !/^[A-Z0-9]+$/.test(formData.code)) {
      newErrors.code = 'Coupon code can only contain uppercase letters and numbers';
    }

    // Date validation
    if (formData.validFrom && formData.validTo) {
      if (new Date(formData.validTo) <= new Date(formData.validFrom)) {
        newErrors.validTo = 'Valid to date must be after valid from date';
      }
    }

    // Type-specific validation
    if (formData.type === 'percentage') {
      if (!formData.maxDiscount || formData.maxDiscount <= 0) {
        newErrors.maxDiscount = 'Maximum discount is required for percentage coupons';
      }
      if (formData.value > 100) {
        newErrors.value = 'Percentage cannot exceed 100%';
      }
    }

    if (formData.type === 'buy_x_get_y') {
      if (!formData.buyXGetY.buyQuantity || formData.buyXGetY.buyQuantity < 1) {
        newErrors.buyQuantity = 'Buy quantity must be at least 1';
      }
      if (!formData.buyXGetY.getQuantity || formData.buyXGetY.getQuantity < 1) {
        newErrors.getQuantity = 'Get quantity must be at least 1';
      }
    }

    // Usage limit validation
    if (formData.usageLimit.total && formData.usageLimit.total < 1) {
      newErrors.usageLimitTotal = 'Total usage limit must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        code: formData.code.toUpperCase(),
        value: parseFloat(formData.value),
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
        usageLimit: {
          total: formData.usageLimit.total ? parseInt(formData.usageLimit.total) : null,
          perUser: parseInt(formData.usageLimit.perUser) || 1
        }
      };

      if (coupon) {
        await updateCoupon(coupon._id, submitData);
        toast.success('Coupon updated successfully!');
      } else {
        await createCoupon(submitData);
        toast.success('Coupon created successfully!');
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear related error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      applicableProducts: {
        ...prev.applicableProducts,
        categories: prev.applicableProducts.categories.includes(category)
          ? prev.applicableProducts.categories.filter(c => c !== category)
          : [...prev.applicableProducts.categories, category]
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {coupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., SAVE20"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Holiday Sale"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Describe what this coupon is for..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="percentage">Percentage Discount</option>
                <option value="fixed">Fixed Amount Discount</option>
                <option value="free_shipping">Free Shipping</option>
                <option value="buy_x_get_y">Buy X Get Y</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value *
              </label>
              <div className="relative">
                {formData.type === 'percentage' && (
                  <span className="absolute right-3 top-2 text-gray-500">%</span>
                )}
                {(formData.type === 'fixed' || formData.type === 'free_shipping') && (
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                )}
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  min="0"
                  step={formData.type === 'percentage' ? '1' : '0.01'}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    formData.type === 'fixed' || formData.type === 'free_shipping' ? 'pl-8' : ''
                  } ${formData.type === 'percentage' ? 'pr-8' : ''} ${
                    errors.value ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value}</p>}
            </div>

            {formData.type === 'percentage' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Discount Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={formData.maxDiscount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 pl-8 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.maxDiscount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.maxDiscount && <p className="mt-1 text-sm text-red-600">{errors.maxDiscount}</p>}
              </div>
            )}
          </div>

          {/* Buy X Get Y Configuration */}
          {formData.type === 'buy_x_get_y' && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Buy X Get Y Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buy Quantity *
                  </label>
                  <input
                    type="number"
                    name="buyXGetY.buyQuantity"
                    value={formData.buyXGetY.buyQuantity}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.buyQuantity ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.buyQuantity && <p className="mt-1 text-sm text-red-600">{errors.buyQuantity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Get Quantity *
                  </label>
                  <input
                    type="number"
                    name="buyXGetY.getQuantity"
                    value={formData.buyXGetY.getQuantity}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.getQuantity ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.getQuantity && <p className="mt-1 text-sm text-red-600">{errors.getQuantity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Sets
                  </label>
                  <input
                    type="number"
                    name="buyXGetY.maxSets"
                    value={formData.buyXGetY.maxSets}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Validity Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid From *
              </label>
              <input
                type="datetime-local"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.validFrom ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.validFrom && <p className="mt-1 text-sm text-red-600">{errors.validFrom}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid To *
              </label>
              <input
                type="datetime-local"
                name="validTo"
                value={formData.validTo}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.validTo ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.validTo && <p className="mt-1 text-sm text-red-600">{errors.validTo}</p>}
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="minOrderValue"
                  value={formData.minOrderValue}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Usage Limit
              </label>
              <input
                type="number"
                name="usageLimit.total"
                value={formData.usageLimit.total}
                onChange={handleInputChange}
                min="1"
                placeholder="Unlimited"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.usageLimitTotal ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.usageLimitTotal && <p className="mt-1 text-sm text-red-600">{errors.usageLimitTotal}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Per User Limit
              </label>
              <input
                type="number"
                name="usageLimit.perUser"
                value={formData.usageLimit.perUser}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Applicable Products */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Applicable Products
            </label>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {['all', 'specific', 'category', 'exclude'].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="applicableProducts.type"
                      value={type}
                      checked={formData.applicableProducts.type === type}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="capitalize">{type === 'all' ? 'All Products' : type}</span>
                  </label>
                ))}
              </div>

              {formData.applicableProducts.type === 'category' && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Select categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          formData.applicableProducts.categories.includes(category)
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {category.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isAutomatic"
                  checked={formData.isAutomatic}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <span className="text-sm font-medium text-gray-700">
                  Apply Automatically
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="stackable"
                  checked={formData.stackable}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <span className="text-sm font-medium text-gray-700">Stackable</span>
              </label>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="firstTimeOnly"
                  checked={formData.firstTimeOnly}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <span className="text-sm font-medium text-gray-700">
                  First-time Customers Only
                </span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Internal Notes
            </label>
            <textarea
              name="internalNotes"
              value={formData.internalNotes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Internal notes for admin use..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel || onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiSave className="w-4 h-4" />
              )}
              <span>{loading ? 'Saving...' : (coupon ? 'Update Coupon' : 'Create Coupon')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponForm;
