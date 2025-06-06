import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  TruckIcon,
  CubeIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { 
  fetchReturnById
} from '../../store/slices/returnSlice';
import LoadingSpinner from '../common/LoadingSpinner';

const ReturnDetail = () => {
  const { returnId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentReturn, isLoading } = useSelector(state => state.returns);

  useEffect(() => {
    if (returnId) {
      dispatch(fetchReturnById(returnId));
    }
  }, [dispatch, returnId]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case 'processing':
        return <ArrowPathIcon className="h-6 w-6 text-blue-500" />;
      case 'shipped':
        return <TruckIcon className="h-6 w-6 text-purple-500" />;
      default:
        return <ClockIcon className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'shipped':
        return 'text-purple-600 bg-purple-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatReturnNumber = (returnNumber) => {
    return returnNumber ? `#${returnNumber}` : '#---';
  };

  const getReturnReasonText = (reason) => {
    const reasonMap = {
      'damaged': 'Item Damaged',
      'defective': 'Defective Product',
      'wrong_item': 'Wrong Item Received',
      'size_issue': 'Size Issue',
      'quality_issue': 'Quality Issue',
      'not_as_described': 'Not as Described',
      'changed_mind': 'Changed Mind',
      'duplicate_order': 'Duplicate Order',
      'other': 'Other'
    };
    return reasonMap[reason] || reason?.replace('_', ' ').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentReturn) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Return Not Found</h1>
            <p className="text-gray-600 mt-2">The return request you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/returns')}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Back to Returns
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/returns')}
            className="flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Returns
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Return {formatReturnNumber(currentReturn.returnNumber)}
              </h1>
              <p className="mt-2 text-gray-600">
                Order #{currentReturn.order?.orderNumber || currentReturn.order?._id?.slice(-6)}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {getStatusIcon(currentReturn.status)}
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(currentReturn.status)}`}>
                {currentReturn.status.charAt(0).toUpperCase() + currentReturn.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Return Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Return Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Reason</label>
                  <p className="text-gray-900">{getReturnReasonText(currentReturn.primaryReason)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Return Type</label>
                  <p className="text-gray-900 capitalize">{currentReturn.returnType}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Refund</label>
                  <p className="text-xl font-semibold text-green-600">
                    ₹{currentReturn.refundAmount?.toFixed(2) || '0.00'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                  <p className="text-gray-900">{formatDate(currentReturn.createdAt)}</p>
                </div>
              </div>
              
              {currentReturn.description && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="text-gray-900">{currentReturn.description}</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Return Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Return Items</h2>
              
              <div className="space-y-4">
                {currentReturn.items?.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.product?.images?.[0]?.url || '/placeholder.jpg'}
                      alt={item.product?.name || 'Product'}
                      className="w-20 h-20 object-cover rounded"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.product?.name || 'Unknown Product'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        SKU: {item.product?.sku || 'N/A'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-600">Quantity:</span>
                          <span className="ml-2 font-medium">{item.quantity}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Price:</span>
                          <span className="ml-2 font-medium">₹{item.price?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Reason:</span>
                          <span className="ml-2 font-medium capitalize">
                            {item.reason?.replace('_', ' ') || 'Not specified'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Condition:</span>
                          <span className="ml-2 font-medium capitalize">
                            {item.condition || 'Not specified'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Customer Notes */}
            {currentReturn.customerNotes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Customer Notes
                </h2>
                <div className="bg-blue-50 rounded-md p-4">
                  <p className="text-gray-900">{currentReturn.customerNotes}</p>
                </div>
              </motion.div>
            )}

            {/* Images */}
            {currentReturn.images && currentReturn.images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PhotoIcon className="h-5 w-5 mr-2" />
                  Attached Images
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {currentReturn.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`Return evidence ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={() => window.open(image.url, '_blank')}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Return Requested</p>
                    <p className="text-xs text-gray-500">{formatDate(currentReturn.createdAt)}</p>
                  </div>
                </div>
                
                {currentReturn.statusHistory?.map((status, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      status.status === currentReturn.status 
                        ? 'bg-blue-100' 
                        : 'bg-gray-100'
                    }`}>
                      {getStatusIcon(status.status)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {status.status.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(status.timestamp)}</p>
                      {status.notes && (
                        <p className="text-xs text-gray-600 mt-1">{status.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pickup Information */}
            {currentReturn.pickupAddress && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pickup Address</h2>
                
                <div className="space-y-2 text-sm">
                  <p className="text-gray-900">{currentReturn.pickupAddress.street}</p>
                  <p className="text-gray-900">
                    {currentReturn.pickupAddress.city}, {currentReturn.pickupAddress.state}
                  </p>
                  <p className="text-gray-900">
                    {currentReturn.pickupAddress.postalCode}, {currentReturn.pickupAddress.country}
                  </p>
                  {currentReturn.pickupAddress.contactNumber && (
                    <p className="text-gray-600">
                      Contact: {currentReturn.pickupAddress.contactNumber}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Refund Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Refund Information</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expected Refund:</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₹{currentReturn.refundAmount?.toFixed(2) || '0.00'}
                  </span>
                </div>
                
                {currentReturn.refundMethod && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Refund Method:</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {currentReturn.refundMethod.replace('_', ' ')}
                    </span>
                  </div>
                )}
                
                {currentReturn.status === 'completed' && currentReturn.processedAt && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-green-600 font-medium">
                      Refund processed on {formatDate(currentReturn.processedAt)}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnDetail;
