import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Settings,
  Heart,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, userProfile, signOut, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setShowUserMenu(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Tours', path: '/tours' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              WanderLust
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <>
                {/* Cart icon */}
                <Link
                  to="/dashboard"
                  className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">{userProfile?.full_name || 'User'}</span>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2"
                      >
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                        
                        {isAdmin() && (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 py-2 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Dark Mode</span>
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>

              {user ? (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="py-2 text-gray-700 dark:text-gray-300 font-medium">
                    {userProfile?.full_name || 'User'}
                  </div>
                  <Link
                    to="/dashboard"
                    className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 space-y-2">
                  <Link
                    to="/login"
                    className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block btn-primary text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;