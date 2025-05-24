import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const ProductFilters = ({ filters, onFilterChange, categories }) => {
  const handleCategoryChange = (categoryId) => {
    onFilterChange({ category: categoryId });
  };

  const handlePriceRangeChange = (value, index) => {
    const newRange = [...filters.priceRange];
    newRange[index] = parseInt(value);
    onFilterChange({ priceRange: newRange });
  };

  const careLevels = ['Easy', 'Medium', 'Advanced'];
  const sizes = ['Small', 'Medium', 'Large', 'Extra Large'];

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                filters.category === category.id
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm">{category.name}</span>
                <span className="text-xs text-gray-400">({category.count})</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange[0]}
              onChange={(e) => handlePriceRangeChange(e.target.value, 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange[1]}
              onChange={(e) => handlePriceRangeChange(e.target.value, 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          {/* Price Range Slider */}
          <div className="relative">
            <input
              type="range"
              min="0"
              max="2000"
              value={filters.priceRange[1]}
              onChange={(e) => handlePriceRangeChange(e.target.value, 1)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>₹0</span>
              <span>₹2000+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Care Level */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Care Level</h4>
        <div className="space-y-2">
          {careLevels.map((level) => (
            <label key={level} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Plant Size */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Plant Size</h4>
        <div className="space-y-2">
          {sizes.map((size) => (
            <label key={size} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">{size}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Special Features */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Special Features</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">Air Purifying</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">Low Light</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">Pet Safe</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">Flowering</span>
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onFilterChange({
          category: '',
          priceRange: [0, 1000],
          search: '',
          sortBy: 'newest'
        })}
        className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Clear All Filters
      </motion.button>
    </div>
  );
};

export default ProductFilters;
