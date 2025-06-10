import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail,
  Heart,
  Leaf,
  Sparkles,
  TreePine,
  Flower,
  Send
} from 'lucide-react';
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon
} from '../common/SocialIcons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { label: 'Indoor Plants', href: '/shop?category=indoor' },
      { label: 'Outdoor Plants', href: '/shop?category=outdoor' },
      { label: 'Seasonal Plants', href: '/shop?category=seasonal' },
      { label: 'Fruit Plants', href: '/shop?category=fruit' },
      { label: 'Gardening Tools', href: '/shop?category=tools' },
      { label: 'Organic Items', href: '/shop?category=organic' }
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Press', href: '/press' }
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Plant Care Guide', href: '/care-guide' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
      { label: 'Size Guide', href: '/size-guide' }
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Refund Policy', href: '/refund' }
    ]
  };

  const socialLinks = [
    { 
      name: 'Facebook', 
      href: 'https://facebook.com', 
      icon: FacebookIcon,
      color: 'hover:text-blue-400' 
    },
    { 
      name: 'Instagram', 
      href: 'https://instagram.com', 
      icon: InstagramIcon,
      color: 'hover:text-pink-400' 
    },
    { 
      name: 'Twitter', 
      href: 'https://twitter.com', 
      icon: TwitterIcon,
      color: 'hover:text-blue-300' 
    },
    { 
      name: 'YouTube', 
      href: 'https://youtube.com', 
      icon: YoutubeIcon,
      color: 'hover:text-red-400' 
    }
  ];

  return (
    <footer className="bg-gradient-to-br from-forest-900 via-charcoal-900 to-forest-800 text-cream-50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-sage-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-terracotta-500/10 rounded-full blur-3xl animate-sway"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-forest-400/10 rounded-full blur-2xl animate-float animation-delay-2000"></div>
      </div>

      {/* Newsletter Section */}
      <div className="relative bg-gradient-to-r from-forest-800 to-sage-700 border-b border-sage-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Leaf className="h-8 w-8 text-sage-300 animate-sway" />
              <h3 className="text-3xl font-display font-bold text-cream-50">
                Join Our Garden Community
              </h3>
              <Sparkles className="h-8 w-8 text-terracotta-300 animate-pulse" />
            </div>
            <p className="text-sage-100 text-lg mb-8 max-w-2xl mx-auto">
              Get exclusive plant care tips, seasonal guides, and special offers delivered to your inbox. 
              Let's grow together! 🌱
            </p>
            
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sage-400" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-sage-300/30 text-cream-50 placeholder-sage-300 focus:ring-2 focus:ring-sage-400 focus:border-sage-400 focus:outline-none transition-all duration-300"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05, shadow: "0 10px 25px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-gradient-to-r from-terracotta-600 to-terracotta-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-terracotta-500 hover:to-terracotta-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-nature"
              >
                <Send className="h-5 w-5" />
                Subscribe
              </motion.button>
            </motion.form>
          </motion.div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Enhanced Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link to="/" className="flex items-center gap-3 mb-6 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-forest-600 to-sage-600 rounded-2xl flex items-center justify-center shadow-nature group-hover:shadow-glow transition-all duration-300">
                    <Leaf className="h-7 w-7 text-cream-50" />
                  </div>
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-terracotta-400 animate-pulse" />
                </div>
                <span className="text-3xl font-display font-bold bg-gradient-to-r from-cream-50 to-sage-200 bg-clip-text text-transparent">
                  PlantPAP
                </span>
              </Link>
              
              <p className="text-sage-200 mb-8 max-w-md leading-relaxed">
                Your trusted companion in creating magical green spaces. We nurture nature's beauty 
                with premium plants, sustainable tools, and organic treasures. 🌿
              </p>
              
              {/* Enhanced Contact Info */}
              <div className="space-y-4">
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-sage-700/30 hover:border-sage-500/50 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-sage-600 to-forest-600 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-cream-50" />
                  </div>
                  <span className="text-sage-200">
                    123 Garden Street, Green Valley, CA 90210
                  </span>
                </motion.div>
                
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-sage-700/30 hover:border-sage-500/50 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-terracotta-600 to-terracotta-700 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-cream-50" />
                  </div>
                  <span className="text-sage-200">+1 (555) PLANT-ME</span>
                </motion.div>
                
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-sage-700/30 hover:border-sage-500/50 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-forest-600 to-sage-600 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-cream-50" />
                  </div>
                  <span className="text-sage-200">hello@plantpap.com</span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Shop Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-6">
              <TreePine className="h-6 w-6 text-sage-400" />
              <h4 className="text-xl font-semibold text-cream-50">Shop</h4>
            </div>
            <ul className="space-y-3">
              {footerLinks.shop.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href}
                    className="text-sage-300 hover:text-sage-100 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <div className="w-1.5 h-1.5 bg-sage-500 rounded-full group-hover:bg-terracotta-400 transition-colors duration-300"></div>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Enhanced Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Flower className="h-6 w-6 text-terracotta-400" />
              <h4 className="text-xl font-semibold text-cream-50">Company</h4>
            </div>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href}
                    className="text-sage-300 hover:text-sage-100 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <div className="w-1.5 h-1.5 bg-sage-500 rounded-full group-hover:bg-terracotta-400 transition-colors duration-300"></div>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Enhanced Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Heart className="h-6 w-6 text-terracotta-400" />
              <h4 className="text-xl font-semibold text-cream-50">Support</h4>
            </div>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href}
                    className="text-sage-300 hover:text-sage-100 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <div className="w-1.5 h-1.5 bg-sage-500 rounded-full group-hover:bg-terracotta-400 transition-colors duration-300"></div>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Enhanced Social Media Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-sage-700/30"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-6 mb-6 md:mb-0">
              <span className="text-sage-200 font-medium flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-terracotta-400" />
                Connect with Nature:
              </span>
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-sage-700/30 hover:border-sage-500/50 text-sage-300 ${social.color} transition-all duration-300 hover:shadow-glow`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </motion.a>
                  );
                })}
              </div>
            </div>
            
            {/* Enhanced Legal Links */}
            <div className="flex items-center gap-6 flex-wrap justify-center">
              {footerLinks.legal.map((link, index) => (
                <Link 
                  key={index}
                  to={link.href}
                  className="text-sage-300 hover:text-sage-100 transition-colors duration-300 text-sm relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-sage-400 to-terracotta-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Copyright */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-sage-700/30 text-center"
        >
          <p className="text-sage-200 flex items-center justify-center gap-2 text-lg">
            © {currentYear} PlantPAP. Crafted with 
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="h-5 w-5 text-terracotta-400 fill-current" />
            </motion.span>
            for nature enthusiasts worldwide 🌍
          </p>
          <p className="text-sage-400 text-sm mt-2">
            Growing greener tomorrows, one plant at a time
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
