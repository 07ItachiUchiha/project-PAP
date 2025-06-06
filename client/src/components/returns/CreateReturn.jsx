import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  createReturnRequest, 
  checkReturnEligibility, 
  clearErrors 
} from '../../store/slices/returnSlice';
import { fetchOrderById } from '../../store/slices/orderSlice';
import LoadingSpinner from '../common/LoadingSpinner';

const CreateReturn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();
  
  const { 
    createLoading, 
    eligibilityCheck, 
    eligibilityLoading 
  } = useSelector(state => state.returns);
  
  const { currentOrder, isLoading: orderLoading } = useSelector(state => state.orders);
  
  const [formData, setFormData] = useState({
    items: [],
    primaryReason: '',
    description: '',
    returnType: 'refund',
    customerNotes: '',
    pickupAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      contactNumber: ''
    }
  });
    const [selectedItems, setSelectedItems] = useState({});
  const [itemReasons, setItemReasons] = useState({});
  const [itemConditionStates, setItemConditionStates] = useState({});
  
  const returnReasons = [
    { value: 'damaged', label: 'Item Damaged' },
    { value: 'defective', label: 'Defective Product' },
    { value: 'wrong_item', label: 'Wrong Item Received' },
    { value: 'size_issue', label: 'Size Issue' },
    { value: 'quality_issue', label: 'Quality Issue' },
    { value: 'not_as_described', label: 'Not as Described' },
    { value: 'changed_mind', label: 'Changed Mind' },
    { value: 'duplicate_order', label: 'Duplicate Order' },
    { value: 'other', label: 'Other' }
  ];
  
  const itemConditions = [
    { value: 'unopened', label: 'Unopened' },
    { value: 'opened', label: 'Opened' },
    { value: 'used', label: 'Used' },
    { value: 'damaged', label: 'Damaged' }
  ];

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
      dispatch(checkReturnEligibility(orderId));
    }
    
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch, orderId]);

  useEffect(() => {
    if (currentOrder?.shippingAddress) {
      setFormData(prev => ({
        ...prev,
        pickupAddress: {
          street: currentOrder.shippingAddress.street || '',
          city: currentOrder.shippingAddress.city || '',
          state: currentOrder.shippingAddress.state || '',
          postalCode: currentOrder.shippingAddress.postalCode || '',
          country: currentOrder.shippingAddress.country || '',
          contactNumber: currentOrder.phone || ''
        }
      }));
    }
  }, [currentOrder]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('pickupAddress.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        pickupAddress: {
          ...prev.pickupAddress,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleItemSelection = (productId, checked) => {
    setSelectedItems(prev => ({ ...prev, [productId]: checked }));
    
    if (!checked) {
      // Remove from reasons and conditions if unchecked
      setItemReasons(prev => {
        const newReasons = { ...prev };
        delete newReasons[productId];
        return newReasons;
      });
      setItemConditionStates(prev => {
        const newConditions = { ...prev };
        delete newConditions[productId];
        return newConditions;
      });
    }
  };

  const handleItemReasonChange = (productId, reason) => {
    setItemReasons(prev => ({ ...prev, [productId]: reason }));
  };

  const handleItemConditionChange = (productId, condition) => {
    setItemConditionStates(prev => ({ ...prev, [productId]: condition }));
  };

  const validateForm = () => {
    const selectedProductIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
    
    if (selectedProductIds.length === 0) {
      toast.error('Please select at least one item to return');
      return false;
    }
    
    if (!formData.primaryReason) {
      toast.error('Please select a primary return reason');
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please provide a description for your return');
      return false;
    }
    
    if (formData.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters long');
      return false;
    }
    
    // Validate pickup address
    const { street, city, postalCode, contactNumber } = formData.pickupAddress;
    if (!street.trim() || !city.trim() || !postalCode.trim() || !contactNumber.trim()) {
      toast.error('Please fill in all pickup address fields');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const selectedProductIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
      // Build items array
    const items = selectedProductIds.map(productId => {
      // eslint-disable-next-line no-unused-vars
      const orderItem = currentOrder.items.find(item => item.product._id === productId);
      return {
        product: productId,
        quantity: 1, // For now, assuming quantity of 1. Could be made dynamic
        reason: itemReasons[productId] || formData.primaryReason,
        condition: itemConditionStates[productId] || 'unopened'
      };
    });
    
    const returnData = {
      orderId,
      items,
      primaryReason: formData.primaryReason,
      description: formData.description.trim(),
      returnType: formData.returnType,
      customerNotes: formData.customerNotes.trim(),
      pickupAddress: formData.pickupAddress
    };
    
    try {
      await dispatch(createReturnRequest(returnData)).unwrap();
      toast.success('Return request created successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error(error || 'Failed to create return request');
    }
  };

  if (orderLoading || eligibilityLoading) {
    return <LoadingSpinner />;
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order you're trying to return was not found.</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const eligibility = eligibilityCheck[orderId];
  
  if (eligibility && !eligibility.eligible) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Return Not Eligible</h1>
          <p className="text-gray-600 mb-6">{eligibility.reason}</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Return Request</h1>
          <p className="mt-2 text-gray-600">
            Order #{currentOrder.orderNumber} - 
            {eligibility?.daysLeft && (
              <span className="text-amber-600 ml-2">
                {eligibility.daysLeft} days left to return
              </span>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Order Items Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Items to Return</h2>
            <div className="space-y-4">
              {currentOrder.items.map((item) => (
                <div key={item._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <input
                    type="checkbox"
                    id={`item-${item.product._id}`}
                    checked={selectedItems[item.product._id] || false}
                    onChange={(e) => handleItemSelection(item.product._id, e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <img
                    src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-500">Price: ${item.price}</p>
                  </div>
                  
                  {selectedItems[item.product._id] && (
                    <div className="flex space-x-4">
                      <select
                        value={itemReasons[item.product._id] || ''}
                        onChange={(e) => handleItemReasonChange(item.product._id, e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                      >
                        <option value="">Select Reason</option>
                        {returnReasons.map(reason => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </select>
                      
                      <select
                        value={itemConditions[item.product._id] || 'unopened'}
                        onChange={(e) => handleItemConditionChange(item.product._id, e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                      >
                        {itemConditions.map(condition => (
                          <option key={condition.value} value={condition.value}>
                            {condition.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Return Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Return Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Primary Reason *
                </label>
                <select
                  name="primaryReason"
                  value={formData.primaryReason}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select a reason</option>
                  {returnReasons.map(reason => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Return Type
                </label>
                <select
                  name="returnType"
                  value={formData.returnType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="refund">Refund</option>
                  <option value="exchange">Exchange</option>
                  <option value="store_credit">Store Credit</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Please describe the issue with your order in detail..."
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Minimum 10 characters ({formData.description.length}/1000)
              </p>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <textarea
                name="customerNotes"
                value={formData.customerNotes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional information..."
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Pickup Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pickup Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="pickupAddress.street"
                  value={formData.pickupAddress.street}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  name="pickupAddress.city"
                  value={formData.pickupAddress.city}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  name="pickupAddress.state"
                  value={formData.pickupAddress.state}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="pickupAddress.postalCode"
                  value={formData.pickupAddress.postalCode}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  name="pickupAddress.contactNumber"
                  value={formData.pickupAddress.contactNumber}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createLoading ? 'Creating Return...' : 'Create Return Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReturn;
