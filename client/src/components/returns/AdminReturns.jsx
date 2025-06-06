import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  EyeIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  TruckIcon,
  CubeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { 
  fetchAdminReturns, 
  updateReturnStatus
} from '../../store/slices/returnSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminReturns = () => {
  const dispatch = useDispatch();
  const { adminReturns, isLoading } = useSelector(state => state.returns);
  const [filter, setFilter] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminReturns());
  }, [dispatch]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <TruckIcon className="h-5 w-5 text-purple-500" />;
      case 'completed':
        return <CubeIcon className="h-5 w-5 text-green-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
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
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const handleStatusUpdate = async (returnId, newStatus) => {
    try {
      await dispatch(updateReturnStatus({ 
        returnId, 
        statusData: {
          status: newStatus,
          adminNotes: `Status updated to ${newStatus} by admin`
        }
      })).unwrap();
      toast.success(`Return status updated to ${newStatus}`);
      dispatch(fetchAdminReturns()); // Refresh the list
    } catch (error) {
      toast.error(`Failed to update return status: ${error.message || error}`);
    }
  };

  const filteredReturns = adminReturns?.filter(returnItem => {
    if (filter === 'all') return true;
    return returnItem.status.toLowerCase() === filter.toLowerCase();
  }) || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatReturnNumber = (returnNumber) => {
    return returnNumber ? `#${returnNumber}` : '#---';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Return Management</h1>
              <p className="mt-2 text-gray-600">Manage customer return requests</p>
            </div>
            
            <div className="flex space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Returns</option>
                <option value="requested">Requested</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Returns Cards */}
        {filteredReturns.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Returns Found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No return requests have been submitted yet.'
                : `No returns found with status: ${filter}`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReturns.map((returnRequest) => (
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
                          Return {formatReturnNumber(returnRequest.returnNumber)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Order #{returnRequest.order?.orderNumber || returnRequest.order?._id?.slice(-6)} • 
                          {returnRequest.user?.name || 'Unknown Customer'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(returnRequest.status)}`}>
                        {returnRequest.status.charAt(0).toUpperCase() + returnRequest.status.slice(1)}
                      </span>
                      
                      <button
                        onClick={() => setSelectedReturn(returnRequest)}
                        className="text-green-600 hover:text-green-700 p-2 rounded-md hover:bg-green-50"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Reason:</span>
                      <div className="font-medium text-gray-900 capitalize">
                        {returnRequest.primaryReason?.replace('_', ' ')}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <div className="font-medium text-gray-900 capitalize">
                        {returnRequest.returnType}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Refund Amount:</span>
                      <div className="font-medium text-gray-900">
                        ₹{returnRequest.refundAmount?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <div className="font-medium text-gray-900">
                        {formatDate(returnRequest.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  {returnRequest.status === 'requested' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleStatusUpdate(returnRequest._id, 'approved')}
                          className="flex items-center px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(returnRequest._id, 'rejected')}
                          className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {returnRequest.status === 'approved' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleStatusUpdate(returnRequest._id, 'processing')}
                        className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-1" />
                        Start Processing
                      </button>
                    </div>
                  )}
                  
                  {returnRequest.status === 'processing' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleStatusUpdate(returnRequest._id, 'completed')}
                        className="flex items-center px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Complete Return
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Return Detail Modal */}
        {selectedReturn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setSelectedReturn(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-gray-900">
                    Return Details {formatReturnNumber(selectedReturn.returnNumber)}
                  </h2>
                  <button
                    onClick={() => setSelectedReturn(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Status and Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Return Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <div className="mt-1 flex items-center">
                          {getStatusIcon(selectedReturn.status)}
                          <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReturn.status)}`}>
                            {selectedReturn.status.charAt(0).toUpperCase() + selectedReturn.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Return Type</label>
                        <p className="mt-1 text-sm text-gray-900 capitalize">{selectedReturn.returnType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Primary Reason</label>
                        <p className="mt-1 text-sm text-gray-900 capitalize">
                          {selectedReturn.primaryReason?.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Refund Amount</label>
                        <p className="mt-1 text-lg font-semibold text-green-600">
                          ₹{selectedReturn.refundAmount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedReturn.user?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedReturn.user?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Order Number</label>
                        <p className="mt-1 text-sm text-gray-900">
                          #{selectedReturn.order?.orderNumber || selectedReturn.order?._id?.slice(-6)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Created Date</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(selectedReturn.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedReturn.description && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-md">
                      {selectedReturn.description}
                    </p>
                  </div>
                )}

                {/* Return Items */}
                {selectedReturn.items && selectedReturn.items.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Return Items</h3>
                    <div className="space-y-4">
                      {selectedReturn.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-md">
                          <img
                            src={item.product?.images?.[0]?.url || '/placeholder.jpg'}
                            alt={item.product?.name || 'Product'}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {item.product?.name || 'Unknown Product'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity} • Price: ₹{item.price?.toFixed(2) || '0.00'}
                            </p>
                            <p className="text-sm text-gray-600 capitalize">
                              Reason: {item.reason?.replace('_', ' ')} • 
                              Condition: {item.condition}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedReturn.status === 'requested' && (
                      <>
                        <button
                          onClick={() => {
                            handleStatusUpdate(selectedReturn._id, 'approved');
                            setSelectedReturn(null);
                          }}
                          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Approve Return
                        </button>
                        <button
                          onClick={() => {
                            handleStatusUpdate(selectedReturn._id, 'rejected');
                            setSelectedReturn(null);
                          }}
                          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Reject Return
                        </button>
                      </>
                    )}
                    
                    {selectedReturn.status === 'approved' && (
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedReturn._id, 'processing');
                          setSelectedReturn(null);
                        }}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-1" />
                        Start Processing
                      </button>
                    )}
                    
                    {selectedReturn.status === 'processing' && (
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedReturn._id, 'completed');
                          setSelectedReturn(null);
                        }}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Complete Return
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminReturns;
