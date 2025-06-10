import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  Star,
  Funnel
} from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * Advanced Search and Filter Component
 * Provides comprehensive search, filtering, and sorting functionality
 */
const AdvancedSearch = ({ 
  onSearch, 
  onFilter, 
  className = '',
  placeholder = "Search plants...",
  showFilters = true 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    priceRange: [0, 1000],
    rating: 0,
    inStock: false,
    organic: false,
    difficulty: '',
    lightRequirement: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const filtersRef = useRef(null);

  // Debounce search to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Handle search
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, onSearch]);

  // Handle filter changes
  useEffect(() => {
    if (onFilter) {
      onFilter(activeFilters);
    }
  }, [activeFilters, onFilter]);

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setIsFiltersOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      category: '',
      priceRange: [0, 1000],
      rating: 0,
      inStock: false,
      organic: false,
      difficulty: '',
      lightRequirement: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.category) count++;
    if (activeFilters.rating > 0) count++;
    if (activeFilters.inStock) count++;
    if (activeFilters.organic) count++;
    if (activeFilters.difficulty) count++;
    if (activeFilters.lightRequirement) count++;
    if (activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 1000) count++;
    return count;
  };

  const categories = [
    'Indoor Plants',
    'Outdoor Plants',
    'Succulents',
    'Flowering Plants',
    'Herbs',
    'Trees',
    'Tropical Plants'
  ];

  const difficulties = [
    'Beginner',
    'Intermediate',
    'Advanced'
  ];

  const lightRequirements = [
    'Low Light',
    'Medium Light',
    'Bright Light',
    'Direct Sun'
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'rating', label: 'Rating' },
    { value: 'popularity', label: 'Popular' },
    { value: 'newest', label: 'Newest' }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <motion.div
          animate={{
            scale: isSearchFocused ? 1.02 : 1,
            boxShadow: isSearchFocused 
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}
          transition={{ duration: 0.2 }}
          className="relative"
        >          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all duration-200"
            placeholder={placeholder}
          />          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-10 flex items-center pr-2"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </motion.div>

        {/* Filters Toggle */}
        {showFilters && (
          <div className="absolute right-0 top-0 h-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`h-full px-4 border-l border-gray-300 rounded-r-lg transition-colors duration-200 ${
                isFiltersOpen || getActiveFilterCount() > 0
                  ? 'bg-sage-50 text-sage-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >              <div className="flex items-center space-x-1">
                <Funnel className="w-5 h-5" />
                {getActiveFilterCount() > 0 && (
                  <span className="bg-sage-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getActiveFilterCount()}
                  </span>
                )}
              </div>
            </motion.button>
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            ref={filtersRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-6"
          >            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                Advanced Filters
              </h3>
              <button
                onClick={clearAllFilters}
                className="text-sm text-sage-600 hover:text-sage-700 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={activeFilters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: ${activeFilters.priceRange[0]} - ${activeFilters.priceRange[1]}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={activeFilters.priceRange[0]}
                    onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value), activeFilters.priceRange[1]])}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={activeFilters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [activeFilters.priceRange[0], parseInt(e.target.value)])}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(rating => (                    <button
                      key={rating}
                      onClick={() => handleFilterChange('rating', rating === activeFilters.rating ? 0 : rating)}
                      className="p-1"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          rating <= activeFilters.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Care Difficulty
                </label>
                <select
                  value={activeFilters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500"
                >
                  <option value="">Any Difficulty</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </div>

              {/* Light Requirement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Light Requirement
                </label>
                <select
                  value={activeFilters.lightRequirement}
                  onChange={(e) => handleFilterChange('lightRequirement', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500"
                >
                  <option value="">Any Light</option>
                  {lightRequirements.map(light => (
                    <option key={light} value={light}>{light}</option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <div className="flex space-x-2">
                  <select
                    value={activeFilters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <select
                    value={activeFilters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500"
                  >
                    <option value="asc">↑</option>
                    <option value="desc">↓</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Toggle Options */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={activeFilters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="rounded border-gray-300 text-sage-600 focus:ring-sage-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={activeFilters.organic}
                    onChange={(e) => handleFilterChange('organic', e.target.checked)}
                    className="rounded border-gray-300 text-sage-600 focus:ring-sage-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Organic Only</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearch;
