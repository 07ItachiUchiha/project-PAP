import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  X,
  Smartphone,
  Monitor,
  Sparkles
} from 'lucide-react';
import usePWA from '../../hooks/usePWA';

/**
 * PWA Install Banner Component
 * Shows prompts for installing the PWA on mobile and desktop
 */
const PWAInstallBanner = ({ className = '' }) => {
  const { isInstallable, isInstalled, installPWA } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Check if user has previously dismissed the banner
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await installPWA();
    if (!success) {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Don't show if not installable, already installed, or dismissed
  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-sage-600 to-forest-600 text-white shadow-lg ${className}`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="w-6 h-6 text-sage-200" />
                </motion.div>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm sm:text-base">
                  Install PlantPAP App
                </h3>
                <p className="text-xs sm:text-sm text-sage-100 mt-1">
                  Get the full experience with offline browsing & faster loading
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInstall}
                disabled={isInstalling}
                className="inline-flex items-center px-3 py-2 bg-white text-sage-700 rounded-lg font-medium text-sm hover:bg-sage-50 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isInstalling ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-sage-600 border-t-transparent rounded-full mr-2" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Install
                  </>
                )}
              </motion.button>

              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-sage-500 rounded-full transition-colors duration-200"
                aria-label="Dismiss install banner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * PWA Status Indicator Component
 * Shows online/offline status and app update notifications
 */
const PWAStatusIndicator = ({ className = '' }) => {
  const { isOnline, hasUpdate, updateApp } = usePWA();
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    if (hasUpdate) {
      setShowUpdatePrompt(true);
    }
  }, [hasUpdate]);

  return (
    <>
      {/* Online/Offline Indicator */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`fixed bottom-4 left-4 z-40 ${className}`}
      >
        <div className={`flex items-center px-3 py-2 rounded-full text-sm font-medium shadow-lg ${
          isOnline 
            ? 'bg-green-500 text-white' 
            : 'bg-orange-500 text-white'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isOnline ? 'bg-green-200' : 'bg-orange-200'
          }`} />
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </motion.div>

      {/* Update Available Prompt */}
      <AnimatePresence>
        {showUpdatePrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <SparklesIcon className="w-6 h-6 text-sage-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  Update Available
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  A new version of PlantPAP is ready with improvements and bug fixes.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      updateApp();
                      setShowUpdatePrompt(false);
                    }}
                    className="px-3 py-1.5 bg-sage-600 text-white text-sm rounded-md hover:bg-sage-700 transition-colors"
                  >
                    Update Now
                  </button>
                  <button
                    onClick={() => setShowUpdatePrompt(false)}
                    className="px-3 py-1.5 text-gray-600 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/**
 * PWA Features Showcase Component
 * Highlights PWA capabilities to encourage installation
 */
const PWAFeaturesModal = ({ isOpen, onClose }) => {  const features = [
    {
      icon: Smartphone,
      title: 'Mobile-First Experience',
      description: 'Optimized for mobile shopping with touch-friendly interface'
    },
    {
      icon: Download,
      title: 'Offline Browsing',
      description: 'Browse plants and manage your cart even without internet'
    },
    {
      icon: Monitor,
      title: 'Desktop & Mobile',
      description: 'Works seamlessly across all your devices'
    },
    {
      icon: Sparkles,
      title: 'Lightning Fast',
      description: 'Instant loading with advanced caching technology'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Why Install PlantPAP?
              </h2>
              <p className="text-gray-600">
                Get the best plant shopping experience
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-sage-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-sage-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full bg-sage-600 text-white py-3 rounded-lg font-medium hover:bg-sage-700 transition-colors"
            >
              Got It!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { PWAInstallBanner, PWAStatusIndicator, PWAFeaturesModal };
