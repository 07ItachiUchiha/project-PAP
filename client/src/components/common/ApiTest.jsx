import React, { useState, useEffect } from 'react';

const ApiTest = () => {
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/products');
        const data = await response.json();
        console.log('API Response:', data);
        setProducts(data);
      } catch (err) {
        console.error('API Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="p-4 bg-blue-100">Loading API test...</div>;
  if (error) return <div className="p-4 bg-red-100">Error: {error}</div>;

  return (
    <div className="p-4 bg-green-100">
      <h3 className="font-bold">API Test Results:</h3>
      <p>Products count: {products?.count || 0}</p>
      <p>Total: {products?.total || 0}</p>
      <p>Success: {products?.success ? 'Yes' : 'No'}</p>
      {products?.products && (
        <div className="mt-2">
          <h4 className="font-semibold">Products:</h4>
          {products.products.map((product, index) => (
            <div key={index} className="ml-4">
              • {product.name} - ${product.price}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiTest;
