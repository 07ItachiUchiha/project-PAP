import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { fetchAllOrders } from '../../store/slices/adminSlice';
import { orderAPI } from '../../api/orderAPI';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [currentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  const orderStatuses = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    const loadOrders = () => {
      dispatch(fetchAllOrders({
        page: currentPage,
        limit: ordersPerPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      }));
    };

    loadOrders();
  }, [dispatch, currentPage, ordersPerPage, statusFilter, searchTerm]);

  const handleOpenOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setIsUpdatingStatus(true);
      await orderAPI.updateOrderStatus(orderId, newStatus);
      
      // Update the selected order if it's the one we're updating
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus
        });
      }
      
      // Refresh order list
      dispatch(fetchAllOrders({
        page: currentPage,
        limit: ordersPerPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      }));
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        order._id.toLowerCase().includes(searchTermLower) ||
        (order.user?.name && order.user.name.toLowerCase().includes(searchTermLower)) ||
        (order.user?.email && order.user.email.toLowerCase().includes(searchTermLower))
      );
    }
    
    return true;
  });

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && !orders.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <p className="text-gray-600">Manage customer orders</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by order ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {orderStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <motion.tr 
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{order._id.substring(order._id.length - 6)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.user?.name || 'Guest User'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.user?.email || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{order.totalAmount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleOpenOrderDetails(order)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - implement if needed */}
      </div>

      {/* Order Details Modal */}
      {isOrderDetailsOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Order Details <span className="text-gray-500">#{selectedOrder._id.substring(selectedOrder._id.length - 6)}</span>
              </h2>
              <button
                onClick={() => setIsOrderDetailsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Order Details content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
                <p className="text-gray-700">{selectedOrder.user?.name || 'Guest User'}</p>
                <p className="text-gray-700">{selectedOrder.user?.email || 'No email provided'}</p>
                <p className="text-gray-700">Phone: {selectedOrder.user?.phone || 'N/A'}</p>
              </div>

              {/* Order Status */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold text-gray-900 mb-2">Order Status</h3>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                  
                  <div className="relative w-40">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateOrderStatus(selectedOrder._id, e.target.value)}
                      disabled={isUpdatingStatus}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  <p>Order Date: {formatDate(selectedOrder.createdAt)}</p>
                  <p>Last Updated: {formatDate(selectedOrder.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="border border-gray-200 rounded-md overflow-hidden mb-6">
              <h3 className="font-semibold text-gray-900 px-4 py-3 bg-gray-50 border-b border-gray-200">Order Items</h3>
              <div className="divide-y divide-gray-200">
                {selectedOrder.items.map((item) => (
                  <div key={item._id} className="p-4 flex items-center">
                    {/* Product Image */}
                    <div className="h-16 w-16 border border-gray-200 rounded-md overflow-hidden flex-shrink-0">
                      {item.product && item.product.images && item.product.images.length > 0 ? (
                        <img 
                          src={item.product.images[0].url || item.product.images[0]} 
                          alt={item.product.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 ml-4">
                      <h4 className="text-sm font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</h4>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity} x ₹{item.price} = ₹{item.quantity * item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{selectedOrder.subtotal || selectedOrder.totalAmount}</span>
                </div>
                {selectedOrder.shippingFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping Fee</span>
                    <span className="font-medium">₹{selectedOrder.shippingFee}</span>
                  </div>
                )}
                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">₹{selectedOrder.tax}</span>
                  </div>
                )}
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">-₹{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">₹{selectedOrder.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shippingAddress && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                <address className="not-italic text-gray-700">
                  {selectedOrder.shippingAddress.name && <p>{selectedOrder.shippingAddress.name}</p>}
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                  {selectedOrder.shippingAddress.country && <p>{selectedOrder.shippingAddress.country}</p>}
                </address>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Orders;
