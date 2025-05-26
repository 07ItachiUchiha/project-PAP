import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  ShoppingCartIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = () => {
  const location = useLocation();
  
  // Define navigation items with their paths and icons
  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: HomeIcon
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: ShoppingBagIcon
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: ShoppingCartIcon
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: UsersIcon
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: ChartBarIcon
    }
  ];
  
  return (
    <aside className="bg-white border-r border-gray-200 h-full min-h-screen w-64 fixed left-0 top-0 overflow-y-auto pt-16">
      <div className="px-6 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="bg-green-600 h-6 w-6 rounded-md flex items-center justify-center mr-2">
            <span className="text-white text-sm font-bold">A</span>
          </span>
          Admin Panel
        </h2>
        
        <nav className="space-y-1">
          {navItems.map((item) => {            
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  group flex items-center px-3 py-3 rounded-md w-full
                  ${isActive || 
                    (item.path !== '/admin' && location.pathname.startsWith(item.path))
                    ? 'bg-green-50 text-green-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                  transition-colors duration-200
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon 
                      className={`mr-3 h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-700'}`} 
                      aria-hidden="true" 
                    />
                    <span className="font-medium text-sm">{item.name}</span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="absolute right-0 w-1 h-8 bg-green-600 rounded-l-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
