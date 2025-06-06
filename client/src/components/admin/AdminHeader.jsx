import React from 'react';
import { useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { BellIcon, CogIcon } from '@heroicons/react/24/outline';

const AdminHeader = () => {
  const location = useLocation();
  const path = location.pathname;
    // Determine page title based on current path
  const getPageTitle = () => {
    if (path === '/admin') return 'Dashboard';
    if (path === '/admin/products') return 'Products Management';
    if (path === '/admin/orders') return 'Orders Management';
    if (path === '/admin/coupons') return 'Coupons Management';
    if (path === '/admin/users') return 'User Management';
    if (path === '/admin/analytics') return 'Analytics';
    return 'Admin Panel';
  };
  
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <motion.h1 
          className="text-2xl font-bold text-gray-900"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          key={getPageTitle()} // Re-animate when title changes
          transition={{ duration: 0.3 }}
        >
          {getPageTitle()}
        </motion.h1>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-1 text-gray-500 hover:text-gray-700 transition-colors">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          
          <button className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
            <CogIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
