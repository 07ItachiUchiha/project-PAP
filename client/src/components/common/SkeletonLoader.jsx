import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const SkeletonLoader = ({ type = 'product', count = 8, className = '' }) => {
  const skeletonVariants = {
    pulse: {
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const ProductCardSkeleton = () => (
    <motion.div 
      className="card-nature overflow-hidden"
      variants={skeletonVariants}
      animate="pulse"
    >
      <div className="aspect-square bg-gradient-to-br from-sage-100 to-sage-200 rounded-t-3xl"></div>
      <div className="p-6 space-y-4">
        <div className="h-4 bg-gradient-to-r from-sage-200 to-forest-200 rounded-full"></div>
        <div className="h-3 bg-gradient-to-r from-forest-200 to-sage-200 rounded-full w-3/4"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gradient-to-r from-terracotta-200 to-sage-200 rounded-full w-20"></div>
          <div className="h-8 w-8 bg-gradient-to-br from-sage-200 to-forest-200 rounded-full"></div>
        </div>
      </div>
    </motion.div>
  );

  const CategoryCardSkeleton = () => (
    <motion.div 
      className="card-nature overflow-hidden"
      variants={skeletonVariants}
      animate="pulse"
    >
      <div className="aspect-square bg-gradient-to-br from-sage-100 to-forest-200 rounded-t-3xl"></div>
      <div className="p-6 space-y-3">
        <div className="h-5 bg-gradient-to-r from-sage-200 to-terracotta-200 rounded-full w-3/4"></div>
        <div className="h-3 bg-gradient-to-r from-forest-200 to-sage-200 rounded-full"></div>
        <div className="h-3 bg-gradient-to-r from-sage-200 to-forest-200 rounded-full w-2/3"></div>
      </div>
    </motion.div>
  );

  const ListItemSkeleton = () => (
    <motion.div 
      className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-soft"
      variants={skeletonVariants}
      animate="pulse"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-sage-200 to-forest-200 rounded-2xl flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gradient-to-r from-sage-200 to-terracotta-200 rounded-full"></div>
        <div className="h-3 bg-gradient-to-r from-forest-200 to-sage-200 rounded-full w-2/3"></div>
      </div>
      <div className="h-6 bg-gradient-to-r from-terracotta-200 to-sage-200 rounded-full w-16"></div>
    </motion.div>
  );

  const getSkeletonComponent = () => {
    switch (type) {
      case 'product':
        return ProductCardSkeleton;
      case 'category':
        return CategoryCardSkeleton;
      case 'list':
        return ListItemSkeleton;
      default:
        return ProductCardSkeleton;
    }
  };

  const SkeletonComponent = getSkeletonComponent();

  return (
    <div className={`grid gap-6 ${
      type === 'list' 
        ? 'grid-cols-1' 
        : type === 'category'
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    } ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
