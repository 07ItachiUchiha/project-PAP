import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ShoppingBagIcon, HeartIcon, TruckIcon } from '@heroicons/react/24/outline';
import HeroBanner from '../components/common/HeroBanner';

const Home = () => {
  const features = [
    {
      id: 'premium-quality',
      icon: <ShoppingBagIcon className="h-8 w-8" />,
      title: "Premium Quality Plants",
      description: "Hand-picked, healthy plants delivered to your doorstep",
    },
    {
      id: 'expert-care',
      icon: <HeartIcon className="h-8 w-8" />,
      title: "Expert Care Guides",
      description: "Complete care instructions with every plant purchase",
    },
    {
      id: 'safe-delivery',
      icon: <TruckIcon className="h-8 w-8" />,
      title: "Safe Delivery",
      description: "Secure packaging ensures your plants arrive in perfect condition",
    },
  ];

  const categories = [
    {
      id: 'indoor-plants',
      title: "Indoor Plants",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
      description: "Perfect for home & office spaces",
      link: "/shop?category=indoor",
    },
    {
      id: 'seasonal-plants',
      title: "Seasonal Plants",
      image: "https://images.unsplash.com/photo-1464822759844-d150baec843f?w=400",
      description: "Beautiful seasonal flowering plants",
      link: "/shop?category=seasonal",
    },
    {
      id: 'fruit-plants',
      title: "Fruit Plants",
      image: "https://images.unsplash.com/photo-1574483849894-f4f0e9ad8530?w=400",
      description: "Grow your own organic fruits",
      link: "/shop?category=fruit",
    },
    {
      id: 'gardening-tools',
      title: "Gardening Tools",
      image: "https://images.unsplash.com/photo-1583062097503-6d9b766f723b?w=400",
      description: "Professional gardening equipment",
      link: "/shop?category=tools",
    },  ];

  return (
    <div className="min-h-screen">
      {/* Hero Banner Slider */}
      <HeroBanner />

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Plants?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the highest quality plants and exceptional customer service
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From indoor plants to gardening tools, find everything you need for your green journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="group cursor-pointer"
              >
                <Link to={category.link} className="block" aria-label={`View ${category.title}`}>
                  <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm group-hover:shadow-xl transition-shadow duration-300">
                    <div className="aspect-square">
                      <img 
                        src={category.image} 
                        alt={category.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {category.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Your Garden?
            </h2>
            <p className="text-green-100 text-lg mb-8">
              Join thousands of happy gardeners who trust us for their plant needs
            </p>
            <Link 
              to="/shop"
              className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-semibold rounded-full hover:bg-gray-100 transition-colors duration-300 group"
              aria-label="Browse all plants"
            >
              Browse All Plants
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;