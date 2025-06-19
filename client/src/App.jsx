import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import store from './store';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from './store/slices/authSlice';

// Enhanced Components
import ErrorBoundary from './components/common/ErrorBoundary';
import ToastProvider from './components/common/ToastProvider';
import PerformanceMonitor from './components/common/PerformanceMonitor';
import { PWAInstallBanner, PWAStatusIndicator } from './components/common/PWAComponents';
import RecentlyViewed from './components/common/RecentlyViewed';
import { CurrencyProvider } from './contexts/CurrencyContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import OrganicSection from './pages/OrganicSection';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminCoupons from './pages/admin/Coupons';
import Users from './pages/admin/Users';
import NotFound from './pages/NotFound';

// Return Components
import CreateReturn from './components/returns/CreateReturn';
import UserReturns from './components/returns/UserReturns';
import AdminReturns from './components/returns/AdminReturns';
import ReturnDetail from './components/returns/ReturnDetail';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

import 'react-toastify/dist/ReactToastify.css';

// Admin Layout Component
const AdminLayout = () => {
  // Import Admin components
  const AdminSidebar = React.lazy(() => import('./components/admin/AdminSidebar'));
  const AdminHeader = React.lazy(() => import('./components/admin/AdminHeader'));
  
  return (
    <div className="flex bg-gray-50">
      {/* Admin Sidebar */}
      <React.Suspense fallback={<div className="w-64"></div>}>
        <AdminSidebar />
      </React.Suspense>
      
      {/* Main Content */}
      <div className="ml-64 flex-1 min-h-screen">
        {/* Header */}
        <React.Suspense fallback={<div className="h-16 bg-white"></div>}>
          <AdminHeader />
        </React.Suspense>
        
        {/* Page Content */}
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/coupons" element={<AdminCoupons />} />
            <Route path="/returns" element={<AdminReturns />} />
            <Route path="/users" element={<Users />} />
            <Route path="/analytics" element={<Dashboard />} /> {/* Placeholder until analytics page is created */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

// App Layout Component
const AppLayout = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only fetch profile if we have a token but no user data yet
    if (token && !user) {
      dispatch(getProfile());
    }
  }, [dispatch, token, user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PWAInstallBanner />
      <PWAStatusIndicator />
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/organic" element={<OrganicSection />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/wishlist" element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          } />

          {/* Return Routes */}
          <Route path="/returns" element={
            <ProtectedRoute>
              <UserReturns />
            </ProtectedRoute>
          } />
          <Route path="/returns/create" element={
            <ProtectedRoute>
              <CreateReturn />
            </ProtectedRoute>
          } />
          <Route path="/returns/:returnId" element={
            <ProtectedRoute>
              <ReturnDetail />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          } />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      
      {/* Recently Viewed Floating Component */}
      <RecentlyViewed />
      
      {/* PWA Install Banner */}
      <PWAInstallBanner />
      
      {/* PWA Status Indicator */}
      <PWAStatusIndicator />
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <CurrencyProvider>
          <ToastProvider>
            <PerformanceMonitor />
            <Router>
              <ErrorBoundary>
                <AppLayout />
              </ErrorBoundary>
            </Router>
          </ToastProvider>
        </CurrencyProvider>
      </HelmetProvider>
    </Provider>
  );
}

export default App;
