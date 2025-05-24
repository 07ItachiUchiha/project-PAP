import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  HeartIcon 
} from '@heroicons/react/24/outline';
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
      color: 'hover:text-blue-600' 
    },
    { 
      name: 'Instagram', 
      href: 'https://instagram.com', 
      icon: InstagramIcon,
      color: 'hover:text-pink-600' 
    },
    { 
      name: 'Twitter', 
      href: 'https://twitter.com', 
      icon: TwitterIcon,
      color: 'hover:text-blue-400' 
    },
    { 
      name: 'YouTube', 
      href: 'https://youtube.com', 
      icon: YoutubeIcon,
      color: 'hover:text-red-600' 
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-display font-bold text-white mb-4">
              Stay Connected with Nature
            </h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Get plant care tips, seasonal guides, and exclusive offers delivered to your inbox
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Subscribe
              </motion.button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">🌱</span>
              </div>
              <span className="text-2xl font-display font-bold">PlantPAP</span>
            </Link>
            
            <p className="text-gray-400 mb-6 max-w-md">
              Your trusted partner for premium plants, gardening tools, and organic produce. 
              We help you create beautiful, sustainable green spaces.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPinIcon className="h-5 w-5 text-primary-500" />
                <span className="text-gray-400">
                  123 Garden Street, Green City, GC 12345
                </span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-5 w-5 text-primary-500" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="h-5 w-5 text-primary-500" />
                <span className="text-gray-400">hello@plantpap.com</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href}
                    className="text-gray-400 hover:text-primary-500 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href}
                    className="text-gray-400 hover:text-primary-500 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href}
                    className="text-gray-400 hover:text-primary-500 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-6 mb-4 md:mb-0">
              <span className="text-gray-400 font-medium">Follow Us:</span>
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`text-gray-400 ${social.color} transition-colors duration-300`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </motion.a>
                  );
                })}
              </div>
            </div>
            
            {/* Legal Links */}
            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link, index) => (
                <Link 
                  key={index}
                  to={link.href}
                  className="text-gray-400 hover:text-primary-500 transition-colors duration-300 text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 flex items-center justify-center gap-1">
            © {currentYear} PlantPAP. Made with 
            <HeartIcon className="h-4 w-4 text-red-500 fill-current" />
            for plant lovers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
