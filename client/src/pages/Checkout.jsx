import React from 'react';
import { Link } from 'react-router-dom';

const Checkout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <p className="text-gray-600 mb-6">This page is under construction</p>
        <Link to="/cart" className="text-primary-600 hover:text-primary-700">
          ← Back to Cart
        </Link>
      </div>
    </div>
  );
};

export default Checkout;
