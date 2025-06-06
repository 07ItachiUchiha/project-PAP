import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';

const ReviewSummary = ({ stats, onWriteReview, canWriteReview = false }) => {
  const { totalReviews, averageRating, distribution, percentages } = stats;

  // Render rating distribution bar
  const renderRatingBar = (rating, percentage, count) => (
    <div key={rating} className="flex items-center space-x-3">
      <div className="flex items-center space-x-1 w-16">
        <span className="text-sm text-gray-600">{rating}</span>
        <StarIcon className="h-4 w-4 text-yellow-400" />
      </div>
      
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-yellow-400 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.1 * (5 - rating) }}
        />
      </div>
      
      <div className="w-12 text-right">
        <span className="text-sm text-gray-600">{count}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Customer Reviews
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="flex items-center mr-2">
                {Array.from({ length: 5 }, (_, index) => (
                  <StarIcon
                    key={index}
                    className={`h-5 w-5 ${
                      index < Math.floor(averageRating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-medium text-gray-900">
                {averageRating ? averageRating.toFixed(1) : '0.0'}
              </span>
              <span className="text-sm text-gray-500 ml-1">out of 5</span>
            </div>
            <div className="text-sm text-gray-500">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        
        {canWriteReview && (
          <button
            onClick={onWriteReview}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Rating Distribution */}
      {totalReviews > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Rating Breakdown
          </h4>
          {[5, 4, 3, 2, 1].map(rating => 
            renderRatingBar(
              rating, 
              percentages[rating] || 0, 
              distribution[rating] || 0
            )
          )}
        </div>
      )}

      {/* No reviews message */}
      {totalReviews === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <StarIcon className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-500 mb-4">No reviews yet</p>
          <p className="text-sm text-gray-400">
            Be the first to share your experience with this product
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewSummary;
