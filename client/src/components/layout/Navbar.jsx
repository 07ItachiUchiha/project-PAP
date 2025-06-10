import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Search, 
  Heart, 
  LogOut,
  Settings,
  Package,
  RotateCcw,
  Leaf,
  Sparkles
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalQuantity } = useSelector((state) => state.cart);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err) {
      toast.error(`Logout failed: ${err.message || 'Unknown error'}`);
    }
    setUserMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/organic', label: 'Organic Vegetables' },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/95 backdrop-blur-md shadow-nature sticky top-0 z-50 border-b border-sage-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2"
            >
              <div className="relative">
                <Leaf className="h-8 w-8 text-forest-700 group-hover:text-sage-600 transition-colors duration-300" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-terracotta-500 group-hover:animate-pulse" />
              </div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-forest-800 to-sage-600 bg-clip-text text-transparent">
                PlantPAP
              </span>
            </motion.div>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <motion.div key={link.to} whileHover={{ scale: 1.05 }}>
                <Link
                  to={link.to}
                  className="text-charcoal-700 hover:text-forest-700 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-sage-50 relative group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-forest-700 to-sage-600 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search plants, tools, organic products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-cream-50 border border-sage-200 rounded-full focus:ring-2 focus:ring-sage-300 focus:border-sage-400 focus:bg-white transition-all duration-300 text-charcoal-700 placeholder-charcoal-400"
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-sage-500 group-hover:text-forest-600 transition-colors" />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-2 top-1.5 p-2 bg-forest-700 text-white rounded-full hover:bg-forest-600 transition-colors duration-300"
                >
                  <Search className="h-4 w-4" />
                </motion.button>
              </div>
            </form>
          </div>

          {/* Enhanced Right side buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Enhanced Cart */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link to="/cart" className="relative p-3 text-charcoal-700 hover:text-forest-700 hover:bg-sage-50 rounded-full transition-all duration-300 group">
                <ShoppingCart className="h-6 w-6" />
                {totalQuantity > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-terracotta-600 to-terracotta-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium shadow-soft"
                  >
                    {totalQuantity}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* Enhanced Wishlist */}
            {isAuthenticated && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Link to="/wishlist" className="relative p-3 text-charcoal-700 hover:text-forest-700 hover:bg-sage-50 rounded-full transition-all duration-300 group">
                  <Heart className="h-6 w-6 group-hover:fill-current group-hover:text-terracotta-500" />
                </Link>
              </motion.div>
            )}

            {/* Enhanced User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-3 text-charcoal-700 hover:text-forest-700 hover:bg-sage-50 rounded-full transition-all duration-300 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-forest-700 to-sage-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden lg:block">{user?.name}</span>
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-3xl shadow-nature border border-sage-100 py-2 z-50"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-6 py-3 text-sm text-charcoal-700 hover:text-forest-700 hover:bg-sage-50 transition-all duration-300"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center space-x-3 px-6 py-3 text-sm text-charcoal-700 hover:text-forest-700 hover:bg-sage-50 transition-all duration-300"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Package className="h-4 w-4" />
                        <span>Orders</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center space-x-3 px-6 py-3 text-sm text-charcoal-700 hover:text-forest-700 hover:bg-sage-50 transition-all duration-300"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Heart className="h-4 w-4" />
                        <span>Wishlist</span>
                      </Link>
                      <Link
                        to="/returns"
                        className="flex items-center space-x-3 px-6 py-3 text-sm text-charcoal-700 hover:text-forest-700 hover:bg-sage-50 transition-all duration-300"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Returns</span>
                      </Link>
                      {(user?.role === 'admin' || user?.role === 'seller') && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-3 px-6 py-3 text-sm text-charcoal-700 hover:text-forest-700 hover:bg-sage-50 transition-all duration-300"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      )}
                      <div className="border-t border-sage-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-6 py-3 text-sm text-charcoal-700 hover:text-terracotta-600 hover:bg-terracotta-50 transition-all duration-300"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (                <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-charcoal-700 hover:text-forest-700 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-sage-50"
                >
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="btn-nature-secondary"
                  >
                    Register
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full text-charcoal-700 hover:text-forest-700 hover:bg-sage-50 focus:outline-none transition-all duration-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-sage-100"
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Search plants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-cream-50 border border-sage-200 rounded-full focus:ring-2 focus:ring-sage-300 focus:border-sage-400 focus:bg-white transition-all duration-300 text-charcoal-700"
                  />
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-sage-500" />
                </div>
              </form>

              {/* Mobile Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block px-4 py-3 rounded-xl text-base font-medium text-charcoal-700 hover:text-forest-700 hover:bg-sage-50 transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Cart & Wishlist */}
              <div className="flex items-center space-x-4 pt-4 border-t border-sage-100">
                <Link
                  to="/cart"
                  className="flex items-center space-x-2 px-4 py-3 rounded-xl text-base font-medium text-charcoal-700 hover:text-forest-700 hover:bg-sage-50 transition-all duration-300 flex-1"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {totalQuantity > 0 && (
                      <span className="absolute -top-1 -right-1 bg-terracotta-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {totalQuantity}
                      </span>
                    )}
                  </div>
                  <span>Cart</span>
                </Link>
                
                {isAuthenticated && (
                  <Link
                    to="/wishlist"
                    className="flex items-center space-x-2 px-4 py-3 rounded-xl text-base font-medium text-charcoal-700 hover:text-forest-700 hover:bg-sage-50 transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <Heart className="h-5 w-5" />
                    <span>Wishlist</span>
                  </Link>
                )}
              </div>

              {/* Mobile Auth */}
              {isAuthenticated ? (
                <div className="border-t border-sage-100 pt-4 space-y-2">
                  <div className="px-4 py-2 text-base font-semibold text-forest-700">
                    Welcome, {user?.name}
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-3 rounded-xl text-base font-medium text-charcoal-700 hover:text-forest-700 hover:bg-sage-50 transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-3 rounded-xl text-base font-medium text-charcoal-700 hover:text-forest-700 hover:bg-sage-50 transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Orders
                  </Link>
                  {(user?.role === 'admin' || user?.role === 'seller') && (
                    <Link
                      to="/admin"
                      className="block px-4 py-3 rounded-xl text-base font-medium text-charcoal-700 hover:text-forest-700 hover:bg-sage-50 transition-all duration-300"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-charcoal-700 hover:text-terracotta-600 hover:bg-terracotta-50 transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (                <div className="border-t border-sage-100 pt-4 space-y-3">
                  <Link
                    to="/login"
                    className="block px-4 py-3 rounded-xl text-base font-medium text-center text-charcoal-700 hover:text-forest-700 hover:bg-sage-50 transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 rounded-xl text-base font-medium text-center bg-gradient-to-r from-forest-700 to-sage-600 text-white hover:from-forest-600 hover:to-sage-500 transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
