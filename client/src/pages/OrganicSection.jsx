import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight,
  Sparkles,
  Heart,
  Truck,
  Gift 
} from 'lucide-react';

const OrganicSection = () => {
  const organicCategories = [    {
      title: "Fresh Vegetables",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop&auto=format",
      description: "Farm-fresh organic vegetables",
      items: ["Tomatoes", "Lettuce", "Carrots", "Spinach"],
      link: "/shop?category=vegetables"
    },    {
      title: "Herbs & Microgreens",
      image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=400&fit=crop&auto=format",
      description: "Fresh herbs and nutrient-rich microgreens",
      items: ["Basil", "Mint", "Cilantro", "Microgreens"],
      link: "/shop?category=herbs"
    },    {
      title: "Seasonal Fruits",
      image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop&auto=format",
      description: "Organic seasonal fruits",
      items: ["Strawberries", "Blueberries", "Apples", "Citrus"],
      link: "/shop?category=fruits"
    },    {
      title: "Organic Fertilizers",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&auto=format",
      description: "Natural plant nutrition",
      items: ["Compost", "Organic Manure", "Liquid Fertilizer", "Bone Meal"],
      link: "/shop?category=fertilizers"
    }
  ];  const benefits = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "100% Organic",
      description: "No harmful pesticides or chemicals"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Health First",
      description: "Better nutrition and taste"
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Fresh Delivery",
      description: "Harvest to doorstep in 24 hours"
    },
    {
      icon: <Gift className="h-8 w-8" />,
      title: "Quality Promise",
      description: "100% satisfaction guaranteed"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-green-100 py-20 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2322c55e' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-6xl mb-6">🥬</div>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-gray-900 mb-6">
                Organic 
                <span className="text-green-600"> Vegetables</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Farm-fresh, chemical-free organic vegetables and herbs delivered straight to your kitchen. 
                Taste the difference nature intended.
              </p>
              <Link 
                to="/shop?category=organic"
                className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors duration-300 group"              >
                Shop Organic Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Why Choose Our Organic Products?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We partner with local farmers committed to sustainable, organic farming practices
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
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
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Fresh Organic Categories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From crisp vegetables to aromatic herbs, discover our full range of organic products
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {organicCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <Link to={category.link} className="block">
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden group-hover:shadow-xl transition-shadow duration-300">
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={category.image} 
                        alt={category.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {category.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {category.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {category.items.slice(0, 3).map((item, itemIndex) => (
                          <span 
                            key={itemIndex}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                          >
                            {item}
                          </span>
                        ))}
                        {category.items.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{category.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fresh Guarantee Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-6xl mb-6">🌱</div>
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              Farm to Table Freshness
            </h2>
            <p className="text-green-100 text-lg mb-8">
              Our organic vegetables are harvested at peak ripeness and delivered within 24 hours. 
              Experience the true taste of nature with every bite.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/shop?category=vegetables"
                className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-semibold rounded-full hover:bg-gray-100 transition-colors duration-300"
              >
                Browse Vegetables
              </Link>
              <Link 
                to="/shop?category=herbs"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-green-600 transition-colors duration-300"
              >
                Fresh Herbs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default OrganicSection;
