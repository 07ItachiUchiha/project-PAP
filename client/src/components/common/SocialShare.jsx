import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share,
  Link,
  X
} from 'lucide-react';
import { 
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  PinterestIcon,
  WhatsAppIcon,
  EmailIcon
} from './SocialIcons';
import { useToast } from './ToastProvider';

/**
 * Social Sharing Component
 * Provides social media sharing options for products
 */
const SocialShare = ({ 
  product, 
  isOpen, 
  onClose, 
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!product) return null;

  const shareUrl = `${window.location.origin}/product/${product._id}`;
  const shareTitle = `Check out this amazing plant: ${product.name}`;
  const shareDescription = product.description || `Discover the beauty of ${product.name} at PlantPAP - your trusted plant companion.`;
  const shareImage = product.image || product.images?.[0];

  // Social sharing URLs
  const shareLinks = [
    {
      name: 'Facebook',
      icon: FacebookIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`
    },
    {
      name: 'Twitter',
      icon: TwitterIcon,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}&hashtags=plants,gardening,PlantPAP`
    },
    {
      name: 'Pinterest',
      icon: PinterestIcon,
      color: 'bg-red-600 hover:bg-red-700',
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(shareImage)}&description=${encodeURIComponent(shareDescription)}`
    },
    {
      name: 'WhatsApp',
      icon: WhatsAppIcon,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`
    },
    {
      name: 'Email',
      icon: EmailIcon,
      color: 'bg-gray-600 hover:bg-gray-700',
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareDescription}\n\nCheck it out: ${shareUrl}`)}`
    }
  ];

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast('Failed to copy link', 'error');
    }
  };

  // Handle social share
  const handleShare = (url) => {
    window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  };

  // Native share API (if available)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          showToast('Error sharing', 'error');
        }
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <ShareIcon className="w-6 h-6 mr-2" />
                Share Product
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Product Preview */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <img
                  src={shareImage}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 line-clamp-2">
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    ${product.price}
                  </p>
                </div>
              </div>
            </div>

            {/* Share Options */}
            <div className="p-6">
              {/* Native Share (if supported) */}
              {navigator.share && (
                <div className="mb-6">
                  <button
                    onClick={handleNativeShare}
                    className="w-full bg-sage-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-sage-700 transition-colors flex items-center justify-center"
                  >
                    <ShareIcon className="w-5 h-5 mr-2" />
                    Share via Device
                  </button>
                </div>
              )}

              {/* Social Media Links */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Share on Social Media
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {shareLinks.map((platform) => {
                    const IconComponent = platform.icon;
                    return (
                      <motion.button
                        key={platform.name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleShare(platform.url)}
                        className={`${platform.color} text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span>{platform.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Copy Link */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-3">
                  Copy Link
                </h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyToClipboard}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                      copied
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </motion.button>
                </div>
              </div>

              {/* Share Statistics (if available) */}
              {product.shareCount && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    This product has been shared {product.shareCount} times
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SocialShare;
