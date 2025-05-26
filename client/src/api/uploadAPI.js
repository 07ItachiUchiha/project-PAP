import api from './index';

// Upload product image
export const uploadProductImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('images', file); // Changed from 'image' to 'images'

    const response = await api.post('/upload/product-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Upload multiple product images
export const uploadProductImages = async (files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post('/upload/product-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete product image
export const deleteProductImage = async (filename) => {
  try {
    const response = await api.delete('/upload/product-image', {
      data: { filename }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
