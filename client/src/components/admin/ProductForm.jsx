import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/adminAPI';
import ImageUpload from './ImageUpload';
import { toast } from 'react-toastify';
import { 
  InformationCircleIcon,
  PhotoIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  TagIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    discount: '',
    category: 'plants',
    type: '',
    images: [],
    stock: '',
    sku: '',
    isOrganic: false,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    tags: '',
    careInstructions: '',
    sunlightRequirement: '',
    wateringFrequency: '',
    careLevel: '',
    plantHeight: '',
    plantSpread: '',
    bloomTime: '',
    weight: '',
    dimensions: '',
    color: '',
    metaTitle: '',
    metaDescription: '',
    slug: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);
  const categories = [
    { value: 'plants', label: 'Plants' },
    { value: 'organic-vegetables', label: 'Organic Vegetables' },
    { value: 'tools', label: 'Garden Tools' },
    { value: 'organic-supplies', label: 'Organic Supplies' },
    { value: 'decorative', label: 'Decorative Items' },
    { value: 'flower-pots', label: 'Flower Pots' },
    { value: 'seeds', label: 'Seeds & Bulbs' },
    { value: 'gift-plants', label: 'Gift Plants' }
  ];

  const plantTypes = [
    { value: 'herbs', label: 'Herbs' },
    { value: 'fruit-plants', label: 'Fruit Plants' },
    { value: 'flowering-plants', label: 'Flowering Plants' },
    { value: 'indoor-plants', label: 'Indoor Plants' },
    { value: 'outdoor-plants', label: 'Outdoor Plants' },
    { value: 'succulents', label: 'Succulents & Cacti' },
    { value: 'bonsai', label: 'Bonsai Plants' },
    { value: 'medicinal-plants', label: 'Medicinal Plants' },
    { value: 'air-purifying-plants', label: 'Air Purifying Plants' },
    { value: 'ornamental-plants', label: 'Ornamental Plants' }
  ];

  const toolTypes = [
    { value: 'gardening-tools', label: 'Gardening Tools' },
    { value: 'watering-tools', label: 'Watering Tools' },
    { value: 'pruning-tools', label: 'Pruning Tools' },
    { value: 'digging-tools', label: 'Digging Tools' },
    { value: 'garden-gloves', label: 'Garden Gloves' },
    { value: 'plant-support', label: 'Plant Support' },
    { value: 'garden-maintenance', label: 'Garden Maintenance' }
  ];

  const supplyTypes = [
    { value: 'fertilizers', label: 'Fertilizers' },
    { value: 'soil', label: 'Soil & Potting Mix' },
    { value: 'seeds', label: 'Seeds' },
    { value: 'pest-control', label: 'Pest Control' },
    { value: 'plant-food', label: 'Plant Food' },
    { value: 'compost', label: 'Compost & Manure' },
    { value: 'mulch', label: 'Mulch & Ground Cover' }
  ];

  const sunlightOptions = [
    { value: 'full-sun', label: 'Full Sun' },
    { value: 'partial-sun', label: 'Partial Sun' },
    { value: 'partial-shade', label: 'Partial Shade' },
    { value: 'full-shade', label: 'Full Shade' },
    { value: 'filtered-light', label: 'Filtered Light' },
    { value: 'indoor', label: 'Indoor Light' }
  ];

  const wateringOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'alternate-days', label: 'Alternate Days' },
    { value: 'twice-weekly', label: 'Twice Weekly' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];
  
  const careLevelOptions = [
    { value: 'easy', label: 'Easy - Low Maintenance' },
    { value: 'moderate', label: 'Moderate - Regular Care' },
    { value: 'difficult', label: 'Difficult - Expert Care' }
  ];
  
  const colorOptions = [
    { value: 'green', label: 'Green' },
    { value: 'red', label: 'Red' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'purple', label: 'Purple' },
    { value: 'pink', label: 'Pink' },
    { value: 'white', label: 'White' },
    { value: 'orange', label: 'Orange' },
    { value: 'blue', label: 'Blue' },
    { value: 'multi', label: 'Multi-colored' }
  ];
  
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <InformationCircleIcon className="h-5 w-5" /> },
    { id: 'details', label: 'Details', icon: <DocumentTextIcon className="h-5 w-5" /> },
    { id: 'pricing', label: 'Pricing', icon: <CurrencyDollarIcon className="h-5 w-5" /> },
    { id: 'care', label: 'Plant Care', icon: <ShieldCheckIcon className="h-5 w-5" /> },
    { id: 'images', label: 'Images', icon: <PhotoIcon className="h-5 w-5" /> },
    { id: 'seo', label: 'SEO', icon: <TagIcon className="h-5 w-5" /> }
  ];
  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        discount: product.discount || '',
        category: product.category || 'plants',
        type: product.type || '',
        images: product.images || [],
        stock: product.stock || '',
        sku: product.sku || '',
        isOrganic: product.isOrganic || false,
        isFeatured: product.isFeatured || false,
        isNewArrival: product.isNewArrival || false,
        isBestSeller: product.isBestSeller || false,
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        careInstructions: product.careInstructions || '',
        sunlightRequirement: product.sunlightRequirement || '',
        wateringFrequency: product.wateringFrequency || '',
        careLevel: product.careLevel || '',
        plantHeight: product.plantHeight || '',
        plantSpread: product.plantSpread || '',
        bloomTime: product.bloomTime || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        color: product.color || '',
        metaTitle: product.seo?.metaTitle || '',
        metaDescription: product.seo?.metaDescription || '',
        slug: product.seo?.slug || ''
      });
      
      // If the product already has a slug, disable auto-generation
      if (product.seo?.slug) {
        setAutoGenerateSlug(false);
      }
    }
  }, [product]);
  // Generate slug from name
  useEffect(() => {
    if (formData.name && autoGenerateSlug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, autoGenerateSlug]);
  
  // Calculate discount percentage when price and originalPrice change
  useEffect(() => {
    if (formData.originalPrice && formData.price) {
      const originalPrice = parseFloat(formData.originalPrice);
      const currentPrice = parseFloat(formData.price);
      
      if (originalPrice > currentPrice) {
        const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        setFormData(prev => ({ ...prev, discount: discountPercent.toString() }));
      }
    }
  }, [formData.price, formData.originalPrice]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // If changing slug manually, disable auto-generation
    if (name === 'slug') {
      setAutoGenerateSlug(false);
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Function removed - slug toggle is handled directly in the button onClick

  const handleImagesChange = (images) => {
    setFormData(prev => ({ ...prev, images }));
    
    // Clear image error if any images are added
    if (images.length > 0 && errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const getTypeOptions = () => {
    switch (formData.category) {
      case 'plants':
        return plantTypes;
      case 'tools':
        return toolTypes;
      case 'organic-supplies':
        return supplyTypes;
      default:
        return [];
    }
  };
  const validateForm = () => {
    const newErrors = {};

    // Basic required fields
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required';
    if (formData.images.length === 0) newErrors.images = 'At least one image is required';
    
    // Validate slug format
    if (formData.slug) {
      if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
      }
    } else {
      newErrors.slug = 'Slug is required';
    }
    
    // Category-specific validations
    if (formData.category === 'plants' || formData.category === 'organic-vegetables') {
      if (!formData.careInstructions) newErrors.careInstructions = 'Care instructions required for plants';
      if (!formData.sunlightRequirement) newErrors.sunlightRequirement = 'Sunlight requirement needed for plants';
      if (!formData.wateringFrequency) newErrors.wateringFrequency = 'Watering frequency needed for plants';
    }
    
    // SKU validation if provided
    if (formData.sku && !/^[A-Za-z0-9-_]+$/.test(formData.sku)) {
      newErrors.sku = 'SKU can only contain letters, numbers, hyphens and underscores';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      // Scroll to the first error
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }

    setLoading(true);

    try {
      const productData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        discount: formData.discount ? parseFloat(formData.discount) : null,
        stock: parseInt(formData.stock),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        plantHeight: formData.plantHeight ? formData.plantHeight : null,
        plantSpread: formData.plantSpread ? formData.plantSpread : null,
        dimensions: formData.dimensions ? formData.dimensions : null,
        seo: {
          metaTitle: formData.metaTitle || formData.name,
          metaDescription: formData.metaDescription || formData.shortDescription,
          slug: formData.slug
        },
        specifications: {
          careLevel: formData.careLevel,
          sunlightRequirement: formData.sunlightRequirement,
          wateringFrequency: formData.wateringFrequency,
          bloomTime: formData.bloomTime,
          color: formData.color
        }
      };
      
      let result;
      if (product?._id) {
        result = await adminAPI.updateProduct(product._id, productData);
        toast.success('Product updated successfully');
      } else {
        result = await adminAPI.createProduct(productData);
        toast.success('Product created successfully');
      }

      onSave(result.data);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };
  
  // Functions removed - they were declared but never used
  // Clicking on tab buttons directly calls setActiveTab
  // Preview toggle is done inline in the button onClick handler  
  return (
    <div className="max-w-5xl mx-auto p-4 w-full">
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="px-6 pt-4 border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center
                  ${activeTab === tab.id 
                    ? 'border-green-500 text-green-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                <h3 className="text-blue-800 font-medium mb-2 flex items-center">
                  <InformationCircleIcon className="h-5 w-5 mr-1" />
                  Basic Product Information
                </h3>
                <p className="text-sm text-blue-600">
                  Enter the essential details of your product. The product name and description are particularly important
                  for customers and search engine visibility.
                </p>
              </div>
              
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter product name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              
              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.shortDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter a short, compelling description (1-2 sentences)"
                  maxLength={160}
                />
                {errors.shortDescription ? (
                  <p className="text-red-500 text-xs mt-1">{errors.shortDescription}</p>
                ) : (
                  <p className="text-gray-500 text-xs mt-1">{formData.shortDescription.length}/160 characters</p>
                )}
              </div>
              
              {/* Full Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter detailed product description"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
              
              {/* Category and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select type</option>
                    {getTypeOptions().map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="organic, fresh, healthy, indoor"
                />
                <p className="text-gray-500 text-xs mt-1">Tags help customers find your products easier</p>
              </div>
              
              {/* Flags (checkboxes) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isOrganic"
                    checked={formData.isOrganic}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Organic Product</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isNewArrival"
                    checked={formData.isNewArrival}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">New Arrival</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isBestSeller"
                    checked={formData.isBestSeller}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Best Seller</span>
                </label>
              </div>
            </div>
          )}
          
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU (Stock Keeping Unit)
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.sku ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Product SKU"
                  />
                  {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                  <p className="text-gray-500 text-xs mt-1">Unique product identifier for inventory</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (grams)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter weight"
                  />
                  <p className="text-gray-500 text-xs mt-1">Used for shipping calculations</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimensions (LxWxH cm)
                  </label>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 15x10x20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select color</option>
                    {colorOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {formData.category === 'plants' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plant Height (cm)
                      </label>
                      <input
                        type="text"
                        name="plantHeight"
                        value={formData.plantHeight}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g. 25-30"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plant Spread (cm)
                      </label>
                      <input
                        type="text"
                        name="plantSpread"
                        value={formData.plantSpread}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g. 15-20"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bloom Time
                    </label>
                    <input
                      type="text"
                      name="bloomTime"
                      value={formData.bloomTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. Spring-Summer"
                    />
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
                <h3 className="text-green-800 font-medium mb-2 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-1" />
                  Pricing & Inventory Information
                </h3>
                <p className="text-sm text-green-600">
                  Set your product's pricing strategy. If you're offering a discount, fill in both the current price and the original price.
                </p>
              </div>
            
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Price <span className="text-red-500">*</span> ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price ($)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                  />
                  <p className="text-gray-500 text-xs mt-1">Original price before discount</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                    readOnly
                  />
                  <p className="text-gray-500 text-xs mt-1">Auto-calculated from prices</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.stock ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
              </div>
            </div>
          )}
          
          {/* Plant Care Tab */}
          {activeTab === 'care' && (
            <div className="space-y-6">
              {!(formData.category === 'plants' || formData.category === 'organic-vegetables') ? (
                <div className="bg-yellow-50 rounded p-4 text-center">
                  <p className="text-yellow-700">Care information is only relevant for plants and organic vegetables.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sunlight Requirement {formData.category === 'plants' && <span className="text-red-500">*</span>}
                      </label>
                      <select
                        name="sunlightRequirement"
                        value={formData.sunlightRequirement}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.sunlightRequirement ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select sunlight requirement</option>
                        {sunlightOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {errors.sunlightRequirement && <p className="text-red-500 text-xs mt-1">{errors.sunlightRequirement}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Watering Frequency {formData.category === 'plants' && <span className="text-red-500">*</span>}
                      </label>
                      <select
                        name="wateringFrequency"
                        value={formData.wateringFrequency}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.wateringFrequency ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select watering frequency</option>
                        {wateringOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {errors.wateringFrequency && <p className="text-red-500 text-xs mt-1">{errors.wateringFrequency}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Care Level
                    </label>
                    <select
                      name="careLevel"
                      value={formData.careLevel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select care level</option>
                      {careLevelOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Care Instructions {formData.category === 'plants' && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      name="careInstructions"
                      value={formData.careInstructions}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.careInstructions ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter detailed care instructions for this plant"
                    />
                    {errors.careInstructions && <p className="text-red-500 text-xs mt-1">{errors.careInstructions}</p>}
                    <p className="text-gray-500 text-xs mt-1">
                      Include information about watering, light, temperature, humidity, fertilizing, etc.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
                <h3 className="text-yellow-800 font-medium mb-2 flex items-center">
                  <PhotoIcon className="h-5 w-5 mr-1" />
                  Product Images
                </h3>
                <p className="text-sm text-yellow-700">
                  High-quality images help sell your products. Upload at least one image, with the first one being the main product image.
                </p>
              </div>
              
              <ImageUpload
                images={formData.images}
                onImagesChange={handleImagesChange}
                maxImages={5}
              />
              {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
            </div>
          )}
          
          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="bg-purple-50 rounded-lg p-4 mb-6 border border-purple-200">
                <h3 className="text-purple-800 font-medium mb-2 flex items-center">
                  <TagIcon className="h-5 w-5 mr-1" />
                  Search Engine Optimization
                </h3>
                <p className="text-sm text-purple-700">
                  Improve your product's visibility in search engines with optimized metadata.
                  If left blank, the product name and short description will be used.
                </p>
              </div>
              
              {/* Slug with auto-generation toggle */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Product URL Slug <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setAutoGenerateSlug(!autoGenerateSlug)}
                    className={`text-xs px-2 py-1 rounded ${
                      autoGenerateSlug 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {autoGenerateSlug ? 'Auto-generating' : 'Manual'}
                  </button>
                </div>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  readOnly={autoGenerateSlug}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.slug ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="product-url-slug"
                />
                {errors.slug ? (
                  <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
                ) : (
                  <p className="text-gray-500 text-xs mt-1">This will be used in the product URL: /shop/{formData.slug}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="SEO title (default: product name)"
                    maxLength={60}
                  />
                  <p className="text-gray-500 text-xs mt-1">{formData.metaTitle.length}/60 characters recommended</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="SEO description (default: short description)"
                    maxLength={160}
                    rows={3}
                  />
                  <p className="text-gray-500 text-xs mt-1">{formData.metaDescription.length}/160 characters recommended</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Preview Panel (conditional render) */}
          {showPreview && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Preview</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 h-48">
                  {formData.images.length > 0 ? (
                    <img 
                      src={formData.images[0].url} 
                      alt={formData.name} 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-medium">{formData.name || 'Product Name'}</h4>
                  <p className="text-sm text-gray-600 mt-1">{formData.shortDescription || 'Short product description will appear here'}</p>
                  <div className="flex items-baseline mt-2">
                    <span className="font-bold text-lg">${formData.price || '0.00'}</span>
                    {formData.originalPrice && (
                      <span className="ml-2 text-sm text-gray-500 line-through">${formData.originalPrice}</span>
                    )}
                    {formData.discount > 0 && (
                      <span className="ml-2 text-xs text-green-600">Save {formData.discount}%</span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {formData.isOrganic && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Organic</span>
                    )}
                    {formData.isFeatured && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Featured</span>
                    )}
                    {formData.isNewArrival && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">New</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'basic') {
                  setActiveTab('pricing');
                } else if (activeTab === 'pricing') {
                  setActiveTab('care');
                } else if (activeTab === 'care') {
                  setActiveTab('details');
                } else if (activeTab === 'details') {
                  setActiveTab('images');
                } else if (activeTab === 'images') {
                  setActiveTab('seo');
                }
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={activeTab === 'seo'}
            >
              Next Section
            </button>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
              >
                {loading && <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />}
                {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
