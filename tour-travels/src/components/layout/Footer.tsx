import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-primary-500" />
              <span className="text-2xl font-bold">WanderLust</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Discover the world's most amazing destinations with our carefully curated tours and experiences.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Home
              </Link>
              <Link to="/tours" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Tours
              </Link>
              <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Contact
              </Link>
              <Link to="/about" className="block text-gray-400 hover:text-white transition-colors duration-200">
                About Us
              </Link>
            </div>
          </div>

          {/* Tours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Popular Tours</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Adventure Tours
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Cultural Tours
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Wildlife Safari
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Beach Holidays
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary-500 mt-0.5" />
                <span className="text-gray-400">info@wanderlust.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary-500 mt-0.5" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-500 mt-0.5" />
                <span className="text-gray-400">123 Travel Street, Adventure City, AC 12345</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 WanderLust. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;