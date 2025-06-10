import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Leaf, Sparkles } from 'lucide-react';

const LoadingSpinner = ({ size = 'medium', className = '', type = 'leaf' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const iconSizes = {
    small: 'h-3 w-3',
    medium: 'h-5 w-5',
    large: 'h-8 w-8'
  };

  if (type === 'leaf') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="relative"
        >
          <Leaf className={`${iconSizes[size]} text-forest-600`} />
          <motion.div
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="h-2 w-2 text-terracotta-400" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (type === 'nature') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="relative">
          {/* Rotating outer ring */}
          <motion.div
            className={`${sizeClasses[size]} border-3 border-sage-200 border-t-forest-600 border-r-forest-600 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Inner pulsing dot */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ 
              scale: [0.5, 1, 0.5],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
          >
            <div className="w-2 h-2 bg-gradient-to-r from-terracotta-500 to-sage-500 rounded-full" />
          </motion.div>
        </div>
      </div>
    );
  }

  // Default circular spinner with nature colors
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-3 border-sage-200 border-t-forest-600 rounded-full shadow-soft`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export default LoadingSpinner;
