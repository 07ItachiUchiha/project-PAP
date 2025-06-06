import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  EyeIcon,
  XCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { 
  fetchUserReturns, 
  cancelReturnRequest, 
  clearErrors 
} from '../../store/slices/returnSlice';
import { 
  getReturnStatusColor, 
  getReturnStatusText, 
  getReturnReasonText,
  formatReturnNumber 
} from '../../api/returnAPI';
import LoadingSpinner from '../common/LoadingSpinner';

const UserReturns = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { 
    userReturns, 
    userReturnsPagination, 
    isLoading, 
    updateLoading 
  } = useSelector(state => state.returns);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancellingReturn, setCancellingReturn] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    const params = { 
      page: currentPage, 
      limit: 10 
    };
    
    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }
    
    dispatch(fetchUserReturns(params));
    
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch, currentPage, statusFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCancelReturn = async (returnId) => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      await dispatch(cancelReturnRequest({ returnId, reason: cancelReason.trim() })).unwrap();
      toast.success('Return request cancelled successfully');
      setCancellingReturn(null);
      setCancelReason('');
      
      // Refresh the list
      dispatch(fetchUserReturns({ 
        page: currentPage, 
        status: statusFilter !== 'all' ? statusFilter : undefined 
      }));
    } catch (error) {
      toast.error(error || 'Failed to cancel return request');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'requested':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const canCancelReturn = (status) => {
    return ['requested', 'approved'].includes(status);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filterOptions = [
    { value: 'all', label: 'All Returns' },
    { value: 'requested', label: 'Requested' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (isLoading && userReturns.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Returns</h1>
              <p className="mt-2 text-gray-600">Track and manage your return requests</p>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Return
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusFilter(option.value)}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  statusFilter === option.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Returns List */}
        {userReturns.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Returns Found</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'all' 
                ? "You haven't created any return requests yet."
                : `No returns found with status: ${filterOptions.find(opt => opt.value === statusFilter)?.label}`
              }
            </p>
            <button
              onClick={() => navigate('/orders')}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              View Orders
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {userReturns.map((returnRequest) => (
              <motion.div
                key={returnRequest._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(returnRequest.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Return #{formatReturnNumber(returnRequest.returnNumber)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Order #{returnRequest.order?.orderNumber || returnRequest.order?._id?.slice(-6)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getReturnStatusColor(returnRequest.status)}`}>
                        {getReturnStatusText(returnRequest.status)}
                      </span>
                      
                      <div className="flex space-x-2">
                        <Link
                          to={`/returns/${returnRequest._id}`}
                          className="text-green-600 hover:text-green-700 p-2 rounded-md hover:bg-green-50"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        
                        {canCancelReturn(returnRequest.status) && (
                          <button
                            onClick={() => setCancellingReturn(returnRequest._id)}
                            className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50"
                            title="Cancel Return"
                            disabled={updateLoading}
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Reason:</span>
                      <div className="font-medium text-gray-900">
                        {getReturnReasonText(returnRequest.primaryReason)}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Return Type:</span>
                      <div className="font-medium text-gray-900 capitalize">
                        {returnRequest.returnType}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <div className="font-medium text-gray-900">
                        {formatDate(returnRequest.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Return Items */}
                  <div className="mt-4">
                    <span className="text-sm text-gray-600">Items ({returnRequest.items?.length || 0}):</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {returnRequest.items?.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-md px-3 py-1">
                          <img
                            src={item.product?.images?.[0]?.url || '/placeholder.jpg'}
                            alt={item.product?.name || 'Product'}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <span className="text-sm text-gray-700">
                            {item.product?.name || 'Unknown Product'}
                          </span>
                        </div>
                      ))}
                      {returnRequest.items?.length > 3 && (
                        <div className="flex items-center px-3 py-1 bg-gray-100 rounded-md">
                          <span className="text-sm text-gray-600">
                            +{returnRequest.items.length - 3} more
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Expected Refund Amount */}
                  {returnRequest.refundAmount && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Expected Refund:</span>
                        <span className="text-lg font-semibold text-green-600">
                          ₹{returnRequest.refundAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {userReturnsPagination?.pages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex space-x-2">
              {Array.from({ length: userReturnsPagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 text-sm rounded-md ${
                    page === currentPage
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Cancel Return Modal */}
        {cancellingReturn && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Cancel Return Request
                </h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to cancel this return request? This action cannot be undone.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for cancellation *
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Please provide a reason for cancelling this return..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setCancellingReturn(null);
                      setCancelReason('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    disabled={updateLoading}
                  >
                    Keep Return
                  </button>
                  <button
                    onClick={() => handleCancelReturn(cancellingReturn)}
                    disabled={updateLoading || !cancelReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateLoading ? 'Cancelling...' : 'Cancel Return'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReturns;
