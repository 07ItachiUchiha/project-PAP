import React, { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  fallback = '/images/products/placeholder-plant.svg',
  lazy = true,
  aspectRatio = 'square',
  priority = false,
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [inView, setInView] = useState(!lazy || priority);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, inView]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };
  const handleError = () => {
    if (!hasError && currentSrc !== fallback) {
      // Try fallback image first
      setCurrentSrc(fallback);
      setHasError(false);
    } else {
      setHasError(true);
    }
    if (onError) onError();
  };
  // Update src when prop changes
  useEffect(() => {
    if (src !== currentSrc && !hasError) {
      setCurrentSrc(src);
      setIsLoaded(false);
      setHasError(false);
    }
  }, [src, currentSrc, hasError]);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    wide: 'aspect-[16/9]'
  };

  const generateOptimizedSrc = (originalSrc, width = 400) => {
    // If it's an Unsplash image, add optimization parameters
    if (originalSrc?.includes('unsplash.com')) {
      return `${originalSrc}&w=${width}&q=80&fm=webp&fit=crop`;
    }
    
    // For other images, return as-is (you could integrate with other image services)
    return originalSrc;
  };

  const PlaceholderSkeleton = () => (
    <div className={`
      bg-gradient-to-br from-sage-100 to-sage-200 
      animate-pulse flex items-center justify-center
      ${aspectRatioClasses[aspectRatio]} 
      ${className}
    `}>
      <ImageIcon className="h-8 w-8 text-sage-400" />
    </div>
  );

  const ErrorFallback = () => {
    if (fallback) {
      return fallback;
    }
    
    return (
      <div className={`
        bg-gradient-to-br from-gray-100 to-gray-200 
        flex items-center justify-center text-gray-400
        ${aspectRatioClasses[aspectRatio]} 
        ${className}
      `}>
        <div className="text-center">
          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-xs">Image unavailable</p>
        </div>
      </div>
    );
  };

  if (hasError) {
    return <ErrorFallback />;
  }

  return (
    <div ref={imgRef} className={`overflow-hidden ${aspectRatioClasses[aspectRatio]} ${className}`}>
      {!inView && <PlaceholderSkeleton />}
      
      {inView && (
        <>
          {!isLoaded && <PlaceholderSkeleton />}
            <motion.img
            src={generateOptimizedSrc(currentSrc)}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: isLoaded ? 1 : 0,
              scale: isLoaded ? 1 : 1.1
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`
              w-full h-full object-cover
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            loading={priority ? 'eager' : 'lazy'}
            {...props}
          />
        </>
      )}
    </div>
  );
};

export default OptimizedImage;
