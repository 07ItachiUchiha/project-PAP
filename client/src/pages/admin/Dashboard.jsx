import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  UsersIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { fetchDashboardStats } from '../../store/slices/adminSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dashboardStats, isLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const handleAddProduct = () => {
    navigate('/admin/products');
  };
  const handleViewAnalytics = () => {
    // Navigate to analytics page
    navigate('/admin/analytics');
  };

  const handleManageUsers = () => {
    // Navigate to users page
    navigate('/admin/users');
  };
  if (isLoading && !dashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Users',
      value: dashboardStats?.totalUsers || 0,
      icon: UsersIcon,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      name: 'Total Products',
      value: dashboardStats?.totalProducts || 0,
      icon: ShoppingBagIcon,
      color: 'text-green-600 bg-green-100',
    },
    {
      name: 'Total Orders',
      value: dashboardStats?.totalOrders || 0,
      icon: ChartBarIcon,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      name: 'Total Revenue',
      value: `₹${dashboardStats?.totalRevenue || 0}`,
      icon: CurrencyDollarIcon,
      color: 'text-yellow-600 bg-yellow-100',
    },
  ];  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <p className="text-gray-600">Overview of your PlantPAP store</p>
      </div>

      {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              </div>
              <div className="p-6">
                {dashboardStats?.recentOrders?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardStats.recentOrders.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Order #{order._id.slice(-6)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.user?.name || 'Unknown User'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">₹{order.totalAmount}</p>
                          <p className="text-sm text-gray-600 capitalize">{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent orders</p>
                )}
              </div>
            </motion.div>

            {/* Low Stock Products */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
              </div>
              <div className="p-6">
                {dashboardStats?.lowStockProducts?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardStats.lowStockProducts.slice(0, 5).map((product) => (
                      <div key={product._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            Stock: {product.stock} units
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Low Stock
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">All products are well stocked</p>
                )}
              </div>
            </motion.div>
          </div>      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleAddProduct}
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ShoppingBagIcon className="h-5 w-5 mr-2" />
            Add New Product
          </button>
          <button 
            onClick={handleViewAnalytics}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            View Analytics
          </button>
          <button 
            onClick={handleManageUsers}
            className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <UsersIcon className="h-5 w-5 mr-2" />
            Manage Users
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
