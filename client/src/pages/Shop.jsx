import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  FunnelIcon, 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon 
} from '@heroicons/react/24/outline';

import ProductCard from '../components/product/ProductCard';
import ProductFilters from '../components/product/ProductFilters';
import SearchBar from '../components/product/SearchBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
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

  useEffect(() => {
    if (!searchResults) {
      const params = {
        page: searchParams.get('page') || 1,
        category: filters.category,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
        search: filters.search,
        sortBy: filters.sortBy
      };
      
      dispatch(fetchProducts(params));
    }
  }, [dispatch, filters, searchParams, searchResults]);

  // Remove unused function

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setSearchResults(null); // Clear search results when filters change
    // Reset to first page when filters change
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handlePageChange = (page) => {
    searchParams.set('page', page.toString());
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = [
    { id: '', name: 'All Plants', count: products?.totalCount || 0 },
    { id: 'indoor', name: 'Indoor Plants', count: 45 },
    { id: 'outdoor', name: 'Outdoor Plants', count: 32 },
    { id: 'seasonal', name: 'Seasonal Plants', count: 28 },
    { id: 'fruit', name: 'Fruit Plants', count: 15 },
    { id: 'tools', name: 'Gardening Tools', count: 22 },
    { id: 'organic', name: 'Organic Items', count: 18 }
  ];

  if (loading && (!products || products.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                Shop Plants & Garden Essentials
              </h1>
              <p className="text-gray-600 mt-2">
                Discover our collection of premium plants and gardening supplies
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="mt-4 md:mt-0 md:w-96">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search plants..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              <ProductFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                Filters
              </button>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden bg-white rounded-xl shadow-sm p-6 mb-6"
              >
                <ProductFilters 
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  categories={categories}
                />
              </motion.div>
            )}

            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {(products && products.length) || 0} products found
              </p>
              
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Products Grid */}
            {error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <>                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products && products.length > 0 ? products.map((product) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  )) : (
                    <p className="col-span-3 text-center py-8 text-gray-500">No products found matching your criteria</p>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <nav className="flex items-center space-x-2">
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
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
