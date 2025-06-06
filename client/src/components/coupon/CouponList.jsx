import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiSearch,
  FiFilter,
  FiDownload,
  FiMoreVertical,
  FiCheck,
  FiX,
  FiBarChart3
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getAllCoupons, deleteCoupon, bulkCouponOperations, getCouponStats } from '../../api/couponAPI';
import CouponForm from './CouponForm';
import CouponCard from './CouponCard';

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showStats, setShowStats] = useState(null);
  const [bulkOperation, setBulkOperation] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, [filters]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await getAllCoupons(filters);
      setCoupons(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to fetch coupons');
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await deleteCoupon(couponId);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleBulkOperation = async () => {
    if (selectedCoupons.length === 0) {
      toast.error('Please select coupons first');
      return;
    }

    if (!bulkOperation) {
      toast.error('Please select an operation');
      return;
    }

    let confirmMessage = '';
    switch (bulkOperation) {
      case 'activate':
        confirmMessage = `Activate ${selectedCoupons.length} coupon(s)?`;
        break;
      case 'deactivate':
        confirmMessage = `Deactivate ${selectedCoupons.length} coupon(s)?`;
        break;
      case 'delete':
        confirmMessage = `Delete ${selectedCoupons.length} coupon(s)? This action cannot be undone.`;
        break;
      default:
        confirmMessage = `Perform ${bulkOperation} on ${selectedCoupons.length} coupon(s)?`;
    }

    if (!window.confirm(confirmMessage)) return;

    try {
      await bulkCouponOperations(bulkOperation, selectedCoupons);
      toast.success(`Bulk ${bulkOperation} completed successfully`);
      setSelectedCoupons([]);
      setBulkOperation('');
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to perform bulk ${bulkOperation}`);
    }
  };

  const handleSelectCoupon = (couponId) => {
    setSelectedCoupons(prev =>
      prev.includes(couponId)
        ? prev.filter(id => id !== couponId)
        : [...prev, couponId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCoupons.length === coupons.length) {
      setSelectedCoupons([]);
    } else {
      setSelectedCoupons(coupons.map(coupon => coupon._id));
    }
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validTo = new Date(coupon.validTo);

    if (!coupon.isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Inactive</span>;
    }

    if (now < validFrom) {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Scheduled</span>;
    }

    if (now > validTo) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Expired</span>;
    }

    if (coupon.usageLimit.total && coupon.usageCount.total >= coupon.usageLimit.total) {
      return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">Used Up</span>;
    }

    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  const CouponStatsModal = ({ coupon, onClose }) => {
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
      const fetchStats = async () => {
        try {
          const response = await getCouponStats(coupon._id);
          setStats(response.data.stats);
        } catch (error) {
          console.error('Error fetching coupon statistics:', error);
          toast.error('Failed to fetch coupon statistics');
        } finally {
          setLoadingStats(false);
        }
      };

      fetchStats();
    }, [coupon._id]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Coupon Statistics: {coupon.code}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {loadingStats ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalUses}</div>
                    <div className="text-sm text-blue-800">Total Uses</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.uniqueUsers}</div>
                    <div className="text-sm text-green-800">Unique Users</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">${stats.totalSavings.toFixed(2)}</div>
                    <div className="text-sm text-purple-800">Total Savings</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats.conversionRate.toFixed(1)}%</div>
                    <div className="text-sm text-orange-800">Conversion Rate</div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Usage Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Average Order Value:</span>
                        <span className="font-medium">${stats.averageOrderValue.toFixed(2)}</span>
                      </div>
                      {coupon.remainingUses !== null && (
                        <div className="flex justify-between">
                          <span>Remaining Uses:</span>
                          <span className="font-medium">{coupon.remainingUses}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recent Orders</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {stats.recentOrders.map((order) => (
                        <div key={order._id} className="flex justify-between text-sm">
                          <span>#{order.orderNumber}</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No statistics available
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-600">Manage discount coupons and promotional codes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search coupons..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
            <option value="free_shipping">Free Shipping</option>
            <option value="buy_x_get_y">Buy X Get Y</option>
          </select>

          <select
            value={filters.limit}
            onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        {/* Bulk Operations */}
        {selectedCoupons.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-800">
              {selectedCoupons.length} coupon(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <select
                value={bulkOperation}
                onChange={(e) => setBulkOperation(e.target.value)}
                className="px-3 py-1 border border-blue-300 rounded text-sm"
              >
                <option value="">Select action...</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="delete">Delete</option>
              </select>
              <button
                onClick={handleBulkOperation}
                disabled={!bulkOperation}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FiTag className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons found</h3>
            <p className="text-gray-600 mb-4">Create your first coupon to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Coupon
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedCoupons.length === coupons.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coupon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCoupons.includes(coupon._id)}
                          onChange={() => handleSelectCoupon(coupon._id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{coupon.name}</div>
                          <div className="text-sm text-gray-500 font-mono">{coupon.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {coupon.type === 'percentage' && `${coupon.value}%`}
                          {coupon.type === 'fixed' && `$${coupon.value}`}
                          {coupon.type === 'free_shipping' && 'Free Shipping'}
                          {coupon.type === 'buy_x_get_y' && `Buy ${coupon.buyXGetY?.buyQuantity} Get ${coupon.buyXGetY?.getQuantity}`}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">{coupon.type.replace('_', ' ')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {coupon.usageCount.total}
                          {coupon.usageLimit.total && ` / ${coupon.usageLimit.total}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {coupon.usageCount.byUser.length} unique users
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(coupon.validTo).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.ceil((new Date(coupon.validTo) - new Date()) / (1000 * 60 * 60 * 24))} days left
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(coupon)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowStats(coupon)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Statistics"
                          >
                            <FiBarChart3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingCoupon(coupon);
                              setShowForm(true);
                            }}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Edit Coupon"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete Coupon"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{' '}
                    {Math.min(pagination.currentPage * filters.limit, pagination.totalItems)} of{' '}
                    {pagination.totalItems} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={!pagination.hasNext}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Coupon Form Modal */}
      <CouponForm
        coupon={editingCoupon}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCoupon(null);
        }}
        onSuccess={() => {
          fetchCoupons();
          setShowForm(false);
          setEditingCoupon(null);
        }}
      />

      {/* Stats Modal */}
      {showStats && (
        <CouponStatsModal
          coupon={showStats}
          onClose={() => setShowStats(null)}
        />
      )}
    </div>
  );
};

export default CouponList;
