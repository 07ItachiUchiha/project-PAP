import { useEffect, useState, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  UsersIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { adminAPI } from '../../api/adminAPI';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CouponForm from '../../components/admin/CouponForm';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage] = useState(1);
  const [couponsPerPage] = useState(10);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [usageData, setUsageData] = useState(null);

  const statusOptions = [
    { value: 'all', label: 'All Coupons' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'expired', label: 'Expired' },
    { value: 'used_up', label: 'Used Up' }
  ];
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'fixed', label: 'Fixed Amount' }
  ];

  const fetchCoupons = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: couponsPerPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined
      };
      
      const response = await adminAPI.getAllCoupons(params);
      setCoupons(response.data.coupons || []);
    } catch (error) {
      toast.error('Failed to fetch coupons');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, typeFilter, searchTerm, couponsPerPage]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCreateCoupon = () => {
    setSelectedCoupon(null);
    setIsFormOpen(true);
  };

  const handleEditCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (coupon) => {
    setCouponToDelete(coupon);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await adminAPI.deleteCoupon(couponToDelete._id);
      toast.success('Coupon deleted successfully');
      setIsDeleteConfirmOpen(false);
      setCouponToDelete(null);
      fetchCoupons();
    } catch (error) {
      toast.error(`Failed to delete coupon: ${error.message || 'Unknown error'}`);
      console.error('Delete coupon error:', error);
    }
  };

  const handleSaveCoupon = async (couponData) => {
    try {
      if (selectedCoupon) {
        await adminAPI.updateCoupon(selectedCoupon._id, couponData);
      } else {
        await adminAPI.createCoupon(couponData);
      }
      setIsFormOpen(false);
      setSelectedCoupon(null);
      fetchCoupons();
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleViewUsage = async (coupon) => {
    try {
      const response = await adminAPI.getCouponUsage(coupon._id);
      setUsageData(response.data);
      setShowUsageModal(true);
    } catch (error) {
      toast.error(`Failed to fetch usage data: ${error.message || 'Unknown error'}`);
      console.error('View usage error:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Coupon code copied to clipboard');
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (!coupon.isActive) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Inactive</span>;
    }
    
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">Used Up</span>;
    }
    
    if (coupon.validUntil && now > validUntil) {
      return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-600">Expired</span>;
    }
    
    if (coupon.validFrom && now < validFrom) {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">Scheduled</span>;
    }
    
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">Active</span>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading && coupons.length === 0) {
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600">Manage discount coupons and promotional codes</p>
        </div>
        <button
          onClick={handleCreateCoupon}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Create Coupon
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search coupons..."
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
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Until
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
              {filteredCoupons.map((coupon) => (
                <motion.tr 
                  key={coupon._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 font-mono">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {coupon.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">                    <div className="flex items-center">
                      {coupon.discountType === 'percentage' ? (
                        <ReceiptPercentIcon className="h-4 w-4 text-blue-500 mr-1" />
                      ) : (
                        <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-1" />
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {coupon.discountType === 'percentage' 
                          ? `${coupon.discountValue}%` 
                          : `₹${coupon.discountValue}`}
                      </span>
                    </div>
                    {coupon.minimumAmount && (
                      <div className="text-xs text-gray-500">
                        Min: ₹{coupon.minimumAmount}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {coupon.usedCount || 0}
                      {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      Per user: {coupon.userLimit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                      {coupon.validUntil ? formatDate(coupon.validUntil) : 'No expiry'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(coupon)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewUsage(coupon)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Usage"
                    >
                      <ChartBarIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditCoupon(coupon)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(coupon)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}

              {filteredCoupons.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                      ? 'No coupons match your filters' 
                      : 'No coupons created yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
          <div className="max-h-full py-8">
            <CouponForm
              coupon={selectedCoupon}
              onSave={handleSaveCoupon}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedCoupon(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && couponToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <TrashIcon className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Delete Coupon</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the coupon "{couponToDelete.code}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Usage Modal */}
      {showUsageModal && usageData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Coupon Usage Statistics</h3>
              <button
                onClick={() => setShowUsageModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <UsersIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Total Uses</p>
                      <p className="text-2xl font-bold text-blue-900">{usageData.totalUses || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Total Savings</p>
                      <p className="text-2xl font-bold text-green-900">₹{usageData.totalSavings || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {usageData.recentUses && usageData.recentUses.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Recent Usage</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {usageData.recentUses.map((use, index) => (
                      <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{use.user?.name || 'Guest'}</span>
                        <span className="text-sm text-gray-500">{formatDate(use.usedAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Coupons;
