import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  ArrowLeftIcon,
  HomeIcon 
} from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Large 404 with plant illustration */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-primary-600 mb-4">404</div>
            <div className="text-6xl mb-4">🌿</div>
          </div>
          
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          
          <p className="text-gray-600 mb-8">
            Looks like this page got lost in the garden. Don't worry, 
            let's help you find your way back to our beautiful plants!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-300"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
            
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-3 border border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors duration-300"
            >
              <ShoppingBagIcon className="h-5 w-5 mr-2" />
              Browse Plants
            </Link>
          </div>
          
          <div className="mt-8">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-300"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
