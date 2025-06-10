import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * Analytics Dashboard Component
 * Provides comprehensive analytics and insights for the admin
 */
const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState({
    overview: {
      totalRevenue: 45678.90,
      totalOrders: 324,
      totalCustomers: 128,
      conversionRate: 3.2,
      trends: {
        revenue: 12.5,
        orders: 8.3,
        customers: 15.7,
        conversion: -2.1
      }
    },
    revenueData: [],
    orderData: [],
    categoryData: [],
    topProducts: [],
    customerInsights: {},
    trafficSources: []
  });

  // Generate mock data for demonstration
  useEffect(() => {
    const generateMockData = () => {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      
      // Revenue data
      const revenueData = Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        revenue: Math.floor(Math.random() * 2000) + 1000,
        orders: Math.floor(Math.random() * 20) + 5,
        visitors: Math.floor(Math.random() * 500) + 200
      }));

      // Category performance
      const categoryData = [
        { name: 'Indoor Plants', value: 35, sales: 145, color: '#10B981' },
        { name: 'Outdoor Plants', value: 25, sales: 105, color: '#3B82F6' },
        { name: 'Succulents', value: 20, sales: 84, color: '#8B5CF6' },
        { name: 'Tools & Accessories', value: 12, sales: 50, color: '#F59E0B' },
        { name: 'Organic Products', value: 8, sales: 33, color: '#EF4444' }
      ];

      // Top products
      const topProducts = [
        { name: 'Monstera Deliciosa', sales: 45, revenue: 1350, trend: 12.5 },
        { name: 'Fiddle Leaf Fig', sales: 38, revenue: 1140, trend: 8.3 },
        { name: 'Snake Plant', sales: 32, revenue: 640, trend: -2.1 },
        { name: 'Peace Lily', sales: 28, revenue: 560, trend: 15.7 },
        { name: 'Rubber Plant', sales: 24, revenue: 720, trend: 5.2 }
      ];

      // Traffic sources
      const trafficSources = [
        { source: 'Organic Search', visitors: 1234, percentage: 45, color: '#10B981' },
        { source: 'Direct', visitors: 856, percentage: 31, color: '#3B82F6' },
        { source: 'Social Media', visitors: 412, percentage: 15, color: '#8B5CF6' },
        { source: 'Email', visitors: 247, percentage: 9, color: '#F59E0B' }
      ];

      setAnalytics(prev => ({
        ...prev,
        revenueData,
        categoryData,
        topProducts,
        trafficSources
      }));
    };

    generateMockData();
  }, [timeRange]);

  const StatCard = ({ title, value, trend, prefix = '', suffix = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${
          trend > 0 ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <Icon className={`h-6 w-6 ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`} />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {trend > 0 ? (
          <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
        ) : (
          <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
        )}
        <span className={`text-sm font-medium ${
          trend > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {Math.abs(trend)}%
        </span>
        <span className="text-sm text-gray-500 ml-1">vs last period</span>
      </div>
    </motion.div>
  );

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Insights and performance metrics for your plant business
            </p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === option.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={analytics.overview.totalRevenue}
          trend={analytics.overview.trends.revenue}
          icon={CurrencyDollarIcon}
          prefix="$"
        />
        <StatCard
          title="Total Orders"
          value={analytics.overview.totalOrders}
          trend={analytics.overview.trends.orders}
          icon={ShoppingBagIcon}
        />
        <StatCard
          title="New Customers"
          value={analytics.overview.totalCustomers}
          trend={analytics.overview.trends.customers}
          icon={UsersIcon}
        />
        <StatCard
          title="Conversion Rate"
          value={analytics.overview.conversionRate}
          trend={analytics.overview.trends.conversion}
          icon={ChartBarIcon}
          suffix="%"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ClockIcon className="h-4 w-4" />
              <span>Updated hourly</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`$${value}`, name]}
                labelStyle={{ color: '#374151' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Performance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {analytics.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Products</h3>
          <div className="space-y-4">
            {analytics.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${product.revenue}</p>
                  <div className="flex items-center">
                    {product.trend > 0 ? (
                      <TrendingUpIcon className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDownIcon className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${
                      product.trend > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(product.trend)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Traffic Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic Sources</h3>
          <div className="space-y-4">
            {analytics.trafficSources.map((source, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{source.source}</span>
                  <span className="text-sm text-gray-500">{source.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${source.percentage}%`,
                      backgroundColor: source.color
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{source.visitors.toLocaleString()} visitors</span>
                  <div className="flex items-center">
                    <EyeIcon className="h-3 w-3 mr-1" />
                    <span>Active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingBagIcon className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New order received</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UsersIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New customer registered</p>
                <p className="text-xs text-gray-500">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <ChartBarIcon className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Daily report generated</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
