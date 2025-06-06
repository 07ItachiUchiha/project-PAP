import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  StarIcon, 
  HandThumbUpIcon, 
  HandThumbDownIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { markReviewHelpful, unmarkReviewHelpful, reportReview, deleteReview } from '../../api/reviewAPI';
import { useSelector } from 'react-redux';

const ReviewCard = ({ 
  review, 
  onEdit, 
  onDelete, 
  canEdit = false, 
  canDelete = false,
  onHelpfulUpdate 
}) => {
  const { user } = useSelector(state => state.auth);
  const [isHelpful, setIsHelpful] = useState(
    review.helpful?.users?.includes(user?.id) || false
  );
  const [helpfulCount, setHelpfulCount] = useState(review.helpful?.count || 0);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportComment, setReportComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle helpful/unhelpful
  const handleHelpfulClick = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (isHelpful) {
        await unmarkReviewHelpful(review._id);
        setIsHelpful(false);
        setHelpfulCount(prev => prev - 1);
      } else {
        await markReviewHelpful(review._id);
        setIsHelpful(true);
        setHelpfulCount(prev => prev + 1);
      }
      
      if (onHelpfulUpdate) {
        onHelpfulUpdate(review._id, !isHelpful);
      }
    } catch (error) {
      console.error('Error updating helpful status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle report
  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportReason) return;

    setLoading(true);
    try {
      await reportReview(review._id, {
        reason: reportReason,
        comment: reportComment
      });
      setIsReporting(false);
      setReportReason('');
      setReportComment('');
      // Show success message
    } catch (error) {
      console.error('Error reporting review:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    setLoading(true);
    try {
      await deleteReview(review._id);
      if (onDelete) onDelete(review._id);
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render rating stars
  const renderRating = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`h-5 w-5 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {review.user?.avatar ? (
              <img
                src={review.user.avatar}
                alt={review.user.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-sm font-medium text-green-600">
                  {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900">
                {review.user?.name || 'Anonymous'}
              </p>
              {review.verified && (
                <CheckBadgeIcon className="h-4 w-4 text-green-500" title="Verified Purchase" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {renderRating(review.rating)}
              </div>
              <span className="text-xs text-gray-500">{review.age}</span>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {canEdit && (
            <button
              onClick={() => onEdit(review)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Edit Review"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Delete Review"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          {review.title}
        </h4>
        <p className="text-gray-700 leading-relaxed">
          {review.comment}
        </p>
      </div>

      {/* Pros and Cons */}
      {(review.pros?.length > 0 || review.cons?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {review.pros?.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-green-700 mb-2">Pros:</h5>
              <ul className="space-y-1">
                {review.pros.map((pro, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-green-500 mr-2">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {review.cons?.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-red-700 mb-2">Cons:</h5>
              <ul className="space-y-1">
                {review.cons.map((con, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-red-500 mr-2">-</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Review Images */}
      {review.images?.length > 0 && (
        <div className="mb-4">
          <div className="flex space-x-2 overflow-x-auto">
            {review.images.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={`Review image ${index + 1}`}
                className="h-20 w-20 object-cover rounded-lg flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* Admin Reply */}
      {review.adminReply && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
          <div className="flex items-center mb-1">
            <CheckBadgeIcon className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-sm font-medium text-blue-800">Admin Response</span>
          </div>
          <p className="text-sm text-blue-700">{review.adminReply.message}</p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          {user && (
            <button
              onClick={handleHelpfulClick}
              disabled={loading}
              className={`flex items-center space-x-1 text-sm transition-colors disabled:opacity-50 ${
                isHelpful 
                  ? 'text-green-600 hover:text-green-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <HandThumbUpIcon className="h-4 w-4" />
              <span>Helpful ({helpfulCount})</span>
            </button>
          )}
          
          {user && user.id !== review.user?._id && (
            <button
              onClick={() => setIsReporting(true)}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {isReporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Review</h3>
            <form onSubmit={handleReport}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for reporting
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="spam">Spam</option>
                  <option value="fake">Fake review</option>
                  <option value="offensive">Offensive language</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional comments (optional)
                </label>
                <textarea
                  value={reportComment}
                  onChange={(e) => setReportComment(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Provide additional details..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsReporting(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !reportReason}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Reporting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ReviewCard;
