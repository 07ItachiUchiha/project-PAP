import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { fetchWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { addToCart, addToLocalCart } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    } else {
      navigate('/login');
      toast.info('Please login to view your wishlist');
    }
  }, [dispatch, isAuthenticated, navigate]);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId))
      .unwrap()
      .then(() => {
        toast.success('Item removed from wishlist');
      })
      .catch((error) => {
        toast.error(error || 'Failed to remove from wishlist');
      });
  };
  const handleAddToCart = async (productId) => {
    if (isAuthenticated) {
      // API-based cart for authenticated users
      try {
        await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
        toast.success('Added to cart!');
        // Optionally remove from wishlist after adding to cart
        // dispatch(removeFromWishlist(productId));
      } catch (error) {
        toast.error(error || 'Failed to add to cart');
      }
    } else {
      // Local cart for guest users
      // Find the product from wishlist items
      const product = items.find(item => item._id === productId);
      if (product) {
        dispatch(addToLocalCart({ product: product, quantity: 1 }));
        toast.success('Added to cart!');
      } else {
        toast.error('Product not found');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <Link to="/shop" className="text-primary-600 hover:text-primary-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

        {items && items.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <motion.tr 
                      key={item._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0 rounded overflow-hidden">
                            <img
                              src={item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/150'}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <Link to={`/product/${item._id}`} className="text-lg font-medium text-gray-900 hover:text-primary-600">
                              {item.name}
                            </Link>
                            {item.category && (
                              <p className="text-sm text-gray-500">Category: {item.category}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-medium text-gray-900">₹{item.price}</div>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <div className="text-sm text-gray-500 line-through">₹{item.originalPrice}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            onClick={() => handleAddToCart(item._id)}
                            disabled={!item.stock || item.stock <= 0}
                          >
                            <ShoppingCartIcon className="h-4 w-4 mr-1" />
                            Add to Cart
                          </button>
                          <button
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            onClick={() => handleRemoveFromWishlist(item._id)}
                          >
                            <XMarkIcon className="h-4 w-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Explore our collection to add items to your wishlist.</p>
            <Link 
              to="/shop" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Shop Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
