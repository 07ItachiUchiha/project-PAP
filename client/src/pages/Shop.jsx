import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  Search,
  SlidersHorizontal,
  Funnel
} from 'lucide-react';

import ProductCard from '../components/product/ProductCard';
import ProductFilters from '../components/product/ProductFilters';
import SearchBar from '../components/product/SearchBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SkeletonLoader from '../components/common/SkeletonLoader';
import AdvancedSearch from '../components/common/AdvancedSearch';
import { fetchProducts } from '../store/slices/productSlice';

const Shop = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, totalPages, currentPage } = useSelector(state => state.products);

  const [searchResults, setSearchResults] = useState(null);
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    priceRange: [0, 1000],
    search: searchParams.get('q') || '',
    sortBy: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Memoize the search parameters to prevent unnecessary re-renders
  const searchParamsObj = useMemo(() => ({
    page: searchParams.get('page') || '1',
    category: searchParams.get('category') || '',
    q: searchParams.get('q') || ''
  }), [searchParams]);

  // Memoize the API parameters
  const apiParams = useMemo(() => ({
    page: parseInt(searchParamsObj.page, 10),
    category: filters.category,
    minPrice: filters.priceRange[0],
    maxPrice: filters.priceRange[1],
    search: filters.search,
    sortBy: filters.sortBy
  }), [searchParamsObj.page, filters.category, filters.priceRange, filters.search, filters.sortBy]);

  // Fetch products only when necessary parameters change
  useEffect(() => {
    if (!searchResults) {
      dispatch(fetchProducts(apiParams));
    }
  }, [dispatch, apiParams, searchResults]);

  // Update filters when URL parameters change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      category: searchParamsObj.category,
      search: searchParamsObj.q
    }));
  }, [searchParamsObj.category, searchParamsObj.q]);
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setSearchResults(null); // Clear search results when filters change
    
    // Update URL parameters without causing immediate re-render
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', '1');
    
    if (newFilters.category !== undefined) {
      if (newFilters.category) {
        newSearchParams.set('category', newFilters.category);
      } else {
        newSearchParams.delete('category');
      }
    }
    
    if (newFilters.search !== undefined) {
      if (newFilters.search) {
        newSearchParams.set('q', newFilters.search);
      } else {
        newSearchParams.delete('q');
      }
    }
    
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);

  // Advanced search handler with debouncing
  const handleSearch = useCallback((query) => {
    setFilters(prev => ({ ...prev, search: query }));
    setSearchResults(null);
    
    const newSearchParams = new URLSearchParams(searchParams);
    if (query) {
      newSearchParams.set('q', query);
    } else {
      newSearchParams.delete('q');
    }
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);

  // Advanced filter handler
  const handleAdvancedFilter = useCallback((advancedFilters) => {
    setFilters(prev => ({ ...prev, ...advancedFilters }));
    setSearchResults(null);
    
    const newSearchParams = new URLSearchParams(searchParams);
    if (advancedFilters.category) {
      newSearchParams.set('category', advancedFilters.category);
    } else {
      newSearchParams.delete('category');
    }
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);

  const handlePageChange = useCallback((page) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, setSearchParams]);
  const categories = useMemo(() => [
    { id: '', name: 'All Plants', count: products?.totalCount || 0 },
    { id: 'indoor', name: 'Indoor Plants', count: 45 },
    { id: 'outdoor', name: 'Outdoor Plants', count: 32 },
    { id: 'seasonal', name: 'Seasonal Plants', count: 28 },
    { id: 'fruit', name: 'Fruit Plants', count: 15 },
    { id: 'tools', name: 'Gardening Tools', count: 22 },
    { id: 'organic', name: 'Organic Items', count: 18 }
  ], [products?.totalCount]);
  if (loading && (!products || products.length === 0)) {
    return (
      <div className="min-h-screen bg-cream-50">
        {/* Hero Header Section */}
        <div className="bg-gradient-to-br from-forest-800 via-forest-700 to-sage-600 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-cream-50 mb-4">
                  Shop Plants & 
                  <span className="block bg-gradient-to-r from-sage-300 to-terracotta-300 bg-clip-text text-transparent">
                    Garden Essentials
                  </span>
                </h1>
                <p className="text-sage-100 text-lg max-w-xl">
                  Discover our curated collection of premium plants and gardening supplies
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Skeleton */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="card-nature-glass p-6 space-y-6">
                <div className="h-6 bg-gradient-to-r from-sage-200 to-forest-200 rounded-full w-32"></div>
                <div className="space-y-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="h-4 bg-gradient-to-r from-forest-200 to-sage-200 rounded-full"></div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Products Skeleton */}
            <div className="flex-1">
              <SkeletonLoader type="product" count={12} />
            </div>
          </div>
        </div>
      </div>
    );
  }  return (    <div className="min-h-screen bg-cream-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-element absolute top-20 left-10 w-20 h-20 bg-sage-300/10 rounded-full blur-xl"></div>
        <div className="floating-element absolute top-40 right-20 w-32 h-32 bg-terracotta-300/10 rounded-full blur-xl animation-delay-1000"></div>
        <div className="floating-element absolute bottom-20 left-1/4 w-24 h-24 bg-forest-300/10 rounded-full blur-xl animation-delay-2000"></div>
      </div>

      {/* Hero Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-br from-forest-800 via-forest-700 to-sage-600 overflow-hidden"
      >
        {/* Organic shapes background */}
        <div className="absolute inset-0">
          <div className="organic-blob absolute top-10 -right-20 w-96 h-96 bg-sage-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="organic-blob absolute -bottom-20 -left-20 w-80 h-80 bg-terracotta-500/20 rounded-full blur-3xl animate-sway"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold text-cream-50 mb-4">
                Shop Plants & 
                <span className="block bg-gradient-to-r from-sage-300 to-terracotta-300 bg-clip-text text-transparent animate-shimmer">
                  Garden Essentials
                </span>
              </h1>
              <p className="text-sage-100 text-lg max-w-xl">
                Discover our curated collection of premium plants and gardening supplies, 
                carefully selected for your green sanctuary
              </p>
            </motion.div>
              {/* Advanced Search Component */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 md:mt-0 md:w-96"
            >
              <AdvancedSearch
                onSearch={handleSearch}
                onFilter={handleAdvancedFilter}
                placeholder="Search for your perfect plant..."
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-nature"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Sidebar Filters - Desktop */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block w-80 flex-shrink-0"
          >
            <div className="card-nature-glass sticky top-24 backdrop-blur-xl">
              <div className="p-8">                <h3 className="text-xl font-display font-semibold text-charcoal-800 mb-6 flex items-center">
                  <Funnel className="h-6 w-6 text-sage-600 mr-3" />
                  Refine Your Search
                </h3>
                <ProductFilters 
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  categories={categories}
                />
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Enhanced Mobile Filter Button */}
            <div className="lg:hidden mb-8">
              <button
                onClick={() => setShowFilters(!showFilters)}                className="btn-nature-outline flex items-center gap-3 w-full justify-center md:w-auto"
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span className="font-medium">Filter Plants</span>
              </button>
            </div>

            {/* Enhanced Mobile Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="lg:hidden card-nature-glass backdrop-blur-xl mb-8"
              >
                <div className="p-6">                  <h3 className="text-lg font-display font-semibold text-charcoal-800 mb-4 flex items-center">
                    <Funnel className="h-5 w-5 text-sage-600 mr-2" />
                    Filters
                  </h3>
                  <ProductFilters 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    categories={categories}
                  />
                </div>
              </motion.div>
            )}

            {/* Enhanced Sort Options */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-between mb-8 p-6 card-nature-glass backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse"></div>
                <p className="text-charcoal-700 font-medium">
                  <span className="text-forest-700 font-semibold">{(products && products.length) || 0}</span> plants found
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-charcoal-700">Sort by:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                  className="border border-sage-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white text-charcoal-800 shadow-soft transition-all duration-300"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </motion.div>            {/* Enhanced Products Grid */}
            {error ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 card-nature-glass"
              >
                <div className="w-16 h-16 bg-terracotta-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-terracotta-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-charcoal-800 mb-2">Something went wrong</h3>
                <p className="text-terracotta-600 font-medium">{error}</p>
              </motion.div>
            ) : (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {products && products.length > 0 ? products.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: 0.1 * index,
                        ease: "easeOut"
                      }}
                      whileHover={{ y: -5 }}
                      className="group"
                    >
                      <div className="card-nature group-hover:shadow-nature transition-all duration-500">
                        <ProductCard product={product} />
                      </div>
                    </motion.div>
                  )) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="col-span-full text-center py-16"
                    >
                      <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg className="w-10 h-10 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-display font-semibold text-charcoal-800 mb-3">
                          No plants found
                        </h3>
                        <p className="text-sage-600 mb-6">
                          We couldn't find any plants matching your criteria. Try adjusting your filters or search terms.
                        </p>
                        <button 
                          onClick={() => setFilters({ category: '', priceRange: [0, 1000], search: '', sortBy: 'newest' })}
                          className="btn-nature-outline"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="flex justify-center mt-16"
                  >
                    <nav className="flex items-center space-x-2 p-2 card-nature-glass backdrop-blur-sm rounded-2xl">
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <motion.button
                          key={page}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-forest-700 to-sage-600 text-cream-50 shadow-nature'
                              : 'text-charcoal-700 hover:bg-sage-100 hover:text-forest-700'
                          }`}
                        >
                          {page}
                        </motion.button>
                      ))}
                    </nav>
                  </motion.div>
                )}
              </>
            )}

            {/* Loading State for Additional Pages */}
            {loading && products && products.length > 0 && (
              <div className="flex justify-center mt-8">
                <LoadingSpinner />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
