import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRightIcon, 
  ShoppingBagIcon, 
  HeartIcon, 
  TruckIcon,
  SparklesIcon,
  GlobeAltIcon,
  SunIcon
} from '@heroicons/react/24/outline';
import SEO from '../components/common/SEO';

const Home = () => {
  const features = [
    {
      id: 'premium-quality',
      icon: <SparklesIcon className="h-8 w-8" />,
      title: "Premium Quality Plants",
      description: "Hand-picked, healthy plants nurtured with love and care",
      gradient: "from-forest-700 to-sage-600"
    },
    {
      id: 'expert-care',
      icon: <HeartIcon className="h-8 w-8" />,
      title: "Expert Care Guides",
      description: "Comprehensive care instructions with every plant purchase",
      gradient: "from-sage-600 to-terracotta-500"
    },
    {
      id: 'safe-delivery',
      icon: <TruckIcon className="h-8 w-8" />,
      title: "Safe Eco Delivery",
      description: "Sustainable packaging ensures your plants arrive perfectly",
      gradient: "from-terracotta-600 to-forest-700"
    },
  ];

  const categories = [    {
      id: 'indoor-plants',
      title: "Indoor Oasis",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&auto=format",
      description: "Transform your space into a green sanctuary",
      link: "/shop?category=indoor",
      emoji: "🏠"
    },    {
      id: 'seasonal-plants',
      title: "Seasonal Blooms",
      image: "https://images.unsplash.com/photo-1464822759844-d150baec843f?w=400&h=400&fit=crop&auto=format",
      description: "Celebrate nature's cycles with seasonal beauties",
      link: "/shop?category=seasonal",
      emoji: "🌸"
    },    {
      id: 'fruit-plants',
      title: "Harvest Garden",
      image: "https://images.unsplash.com/photo-1574483849894-f4f0e9ad8530?w=400&h=400&fit=crop&auto=format",
      description: "Grow your own organic, delicious fruits",
      link: "/shop?category=fruit",
      emoji: "🍎"
    },    {
      id: 'gardening-tools',
      title: "Garden Essentials",
      image: "https://images.unsplash.com/photo-1583062097503-6d9b766f723b?w=400&h=400&fit=crop&auto=format",
      description: "Professional tools for the discerning gardener",
      link: "/shop?category=tools",
      emoji: "🛠️"
    },
  ];

  // Floating element variants
  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50">
      <SEO 
        title="PlantPAP - Premium Plants & Garden Essentials"
        description="Transform your space into a green sanctuary with our curated collection of premium plants, gardening tools, and organic essentials. Expert care guides included."
        keywords="premium plants, indoor plants, outdoor plants, gardening tools, organic gardening, plant care, nursery, home garden"
      />
      
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 left-10 w-32 h-32 bg-sage-200/30 rounded-full organic-blob"
            variants={floatingVariants}
            animate="animate"
          />
          <motion.div 
            className="absolute top-1/4 right-16 w-24 h-24 bg-terracotta-200/20 rounded-full organic-blob"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 2 }}
          />
          <motion.div 
            className="absolute bottom-1/4 left-1/4 w-16 h-16 bg-forest-200/25 rounded-full organic-blob"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 4 }}
          />
          
          {/* Nature SVG decorations */}
          <div className="absolute top-1/3 right-1/3 text-6xl opacity-10 floating-element">🌿</div>
          <div className="absolute bottom-1/3 left-1/3 text-4xl opacity-15 floating-element">🍃</div>
          <div className="absolute top-1/2 left-20 text-5xl opacity-10 floating-element">🌱</div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-display font-bold mb-8 leading-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-forest-800 via-sage-600 to-terracotta-600 bg-clip-text text-transparent">
                Plant
              </span>
              <span className="text-charcoal-800"> Your</span>
              <br />
              <span className="text-shimmer">Dreams</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-charcoal-600 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Discover the luxury of nature with our premium collection of plants, 
              carefully curated to transform your space into a living masterpiece.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <Link 
                to="/shop"
                className="btn-nature group inline-flex items-center text-lg"
              >
                <SparklesIcon className="w-5 h-5 mr-2 group-hover:animate-spin" />
                Explore Collection
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </Link>
              
              <Link              to="/organic"
                className="btn-nature-outline group inline-flex items-center text-lg"
              >
                <GlobeAltIcon className="w-5 h-5 mr-2 group-hover:text-sage-600" />
                Organic Essentials
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-sage-400 rounded-full flex justify-center">
            <motion.div 
              className="w-1 h-3 bg-sage-500 rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-32 bg-gradient-to-b from-white to-cream-50 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%2387A96B%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-display font-bold text-charcoal-800 mb-6">
              Why Choose <span className="text-forest-700">PlantPAP</span>?
            </h2>
            <p className="text-xl text-charcoal-600 max-w-3xl mx-auto leading-relaxed">
              We're passionate about bringing the healing power of nature into your life 
              with exceptional quality and unmatched service.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="card-nature-glass text-center p-10 group hover:scale-105 transition-all duration-500"
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${feature.gradient} text-white rounded-3xl mb-8 shadow-glow group-hover:animate-pulse`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-display font-semibold text-charcoal-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-charcoal-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Categories Section */}
      <section className="py-32 bg-gradient-to-br from-sage-50 via-cream-50 to-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-sage-200/20 to-forest-200/20 rounded-full organic-blob"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-terracotta-200/20 to-sage-200/20 rounded-full organic-blob"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-display font-bold text-charcoal-800 mb-6">
              Curated <span className="text-sage-600">Collections</span>
            </h2>
            <p className="text-xl text-charcoal-600 max-w-3xl mx-auto leading-relaxed">
              From indoor sanctuaries to outdoor gardens, discover the perfect plants 
              for every space and season.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <Link to={category.link} className="block">
                  <div className="card-nature group-hover:shadow-glow transition-all duration-500 group-hover:-translate-y-3">
                    <div className="relative overflow-hidden rounded-t-3xl aspect-square">
                      <motion.img 
                        src={category.image} 
                        alt={category.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                      <div className="absolute top-4 right-4 text-3xl animate-bounce">
                        {category.emoji}
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-2xl font-display font-semibold text-charcoal-800 mb-3 group-hover:text-forest-700 transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-charcoal-600 leading-relaxed mb-4">
                        {category.description}
                      </p>
                      <div className="flex items-center text-forest-700 font-medium group-hover:text-sage-600 transition-colors">
                        Explore Collection
                        <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-32 gradient-nature relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 text-8xl opacity-10 floating-element">🌳</div>
          <div className="absolute bottom-20 right-20 text-6xl opacity-15 floating-element">🌺</div>
          <div className="absolute top-1/2 left-10 text-7xl opacity-10 floating-element">🦋</div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <motion.h2 
              className="text-5xl md:text-6xl font-display font-bold text-white mb-8 leading-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Ready to Create Your
              <span className="block text-cream-100">Green Paradise?</span>
            </motion.h2>
            <motion.p 
              className="text-xl text-sage-100 mb-12 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Join thousands of nature lovers who trust us to bring the beauty and 
              tranquility of the natural world into their homes and gardens.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link 
                to="/shop"
                className="inline-flex items-center px-10 py-5 bg-white text-forest-700 font-bold text-lg rounded-full hover:bg-cream-50 transition-all duration-300 group shadow-glow hover:shadow-xl transform hover:scale-105"
              >
                <SunIcon className="w-6 h-6 mr-3 group-hover:animate-spin" />
                Start Your Garden Journey
                <ArrowRightIcon className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              
              <Link 
                to="/organic"              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold text-lg rounded-full hover:bg-white hover:text-forest-700 transition-all duration-300 group"
              >
                <GlobeAltIcon className="w-5 h-5 mr-2 group-hover:text-sage-600" />
                Explore Organic
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;