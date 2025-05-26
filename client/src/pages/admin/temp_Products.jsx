import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { fetchProducts } from '../../store/slices/productSlice';
import { deleteProduct } from '../../store/slices/adminSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductForm from '../../components/admin/ProductForm';

const Products = () => {
  const dispatch = useDispatch();
  const { products, isLoading: productsLoading } = useSelector((state) => state.products);
  const { isLoading: adminLoading } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const isLoading = productsLoading || adminLoading;

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteProduct(productToDelete._id)).unwrap();
      toast.success('Product deleted successfully');
      setIsConfirmDeleteOpen(false);
      setProductToDelete(null);
      dispatch(fetchProducts());
    } catch (error) {
      toast.error(error || 'Failed to delete product');
    }
  };

  const handleSaveProduct = () => {
    setIsFormOpen(false);
    dispatch(fetchProducts());
  };

  if (productsLoading && !products.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <button
          onClick={handleAddProduct}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentProducts.map((product) => (
                <motion.tr 
                  key={product._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].url || product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <PlusIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{product.price}</div>
                    {product.discountPrice && (
                      <div className="text-xs text-gray-500 line-through">₹{product.discountPrice}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.stock > 0 ? (
                      <span className="text-sm text-gray-900">
                        {product.stock} {product.stock === 1 ? 'unit' : 'units'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}

              {currentProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? 'No products matching your search' : 'No products added yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProducts.length > productsPerPage && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            
            <div className="text-sm text-gray-700">
              Page {currentPage} of {Math.ceil(filteredProducts.length / productsPerPage)}
            </div>
            
            <button
              onClick={() => paginate(currentPage < Math.ceil(filteredProducts.length / productsPerPage) ? currentPage + 1 : currentPage)}
              disabled={currentPage >= Math.ceil(filteredProducts.length / productsPerPage)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <ProductForm
            onSave={handleSaveProduct} 
            onCancel={() => setIsFormOpen(false)} 
            product={selectedProduct}
          />
        </div>
      )}

      {/* Confirm Delete Modal */}
      {isConfirmDeleteOpen && productToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the product "{productToDelete.name}"? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Products;
