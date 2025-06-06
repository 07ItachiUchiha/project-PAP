import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { StarIcon, XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { createReview, updateReview } from '../../api/reviewAPI';

const ReviewForm = ({ 
  productId, 
  orderId, 
  existingReview = null, 
  onSuccess, 
  onCancel,
  isOpen = false 
}) => {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    pros: [''],
    cons: ['']
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form if editing existing review
  useEffect(() => {
    if (existingReview) {
      setFormData({
        rating: existingReview.rating,
        title: existingReview.title,
        comment: existingReview.comment,
        pros: existingReview.pros.length > 0 ? existingReview.pros : [''],
        cons: existingReview.cons.length > 0 ? existingReview.cons : ['']
      });
    }
  }, [existingReview]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Handle pros/cons changes
  const handleArrayInputChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  // Add new pro/con field
  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  // Remove pro/con field
  const removeArrayField = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be under 100 characters';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Comment is required';
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters';
    } else if (formData.comment.trim().length > 1000) {
      newErrors.comment = 'Comment must be under 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const reviewData = {
        ...formData,
        pros: formData.pros.filter(pro => pro.trim()),
        cons: formData.cons.filter(con => con.trim())
      };

      if (existingReview) {
        await updateReview(existingReview._id, reviewData);
      } else {
        reviewData.orderId = orderId;
        await createReview(productId, reviewData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrors({ 
        submit: error.message || 'Failed to submit review. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Render rating stars
  const renderRatingInput = () => {
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleInputChange('rating', index + 1)}
            className="focus:outline-none"
          >
            {index < formData.rating ? (
              <StarIconSolid className="h-8 w-8 text-yellow-400" />
            ) : (
              <StarIcon className="h-8 w-8 text-gray-300 hover:text-yellow-400 transition-colors" />
            )}
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {formData.rating > 0 ? `${formData.rating} out of 5 stars` : 'Click to rate'}
        </span>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {existingReview ? 'Edit Review' : 'Write a Review'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating *
            </label>
            {renderRatingInput()}
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Summarize your experience in a few words"
              maxLength={100}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.title.length}/100
              </p>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Review *
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.comment ? 'border-red-300' : 'border-gray-300'
              }`}
              rows="4"
              placeholder="Share your detailed thoughts about this product..."
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.comment && (
                <p className="text-sm text-red-600">{errors.comment}</p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.comment.length}/1000
              </p>
            </div>
          </div>

          {/* Pros */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What did you like? (Optional)
            </label>
            {formData.pros.map((pro, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={pro}
                  onChange={(e) => handleArrayInputChange('pros', index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="What was good about this product?"
                  maxLength={200}
                />
                {formData.pros.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('pros', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                )}
                {index === formData.pros.length - 1 && (
                  <button
                    type="button"
                    onClick={() => addArrayField('pros')}
                    className="text-green-500 hover:text-green-700"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Cons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What could be improved? (Optional)
            </label>
            {formData.cons.map((con, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={con}
                  onChange={(e) => handleArrayInputChange('cons', index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="What could be better?"
                  maxLength={200}
                />
                {formData.cons.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('cons', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                )}
                {index === formData.cons.length - 1 && (
                  <button
                    type="button"
                    onClick={() => addArrayField('cons')}
                    className="text-green-500 hover:text-green-700"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Error message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ReviewForm;
