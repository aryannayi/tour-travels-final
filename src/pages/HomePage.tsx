import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Star, 
  Users, 
  Award, 
  Shield, 
  Clock,
  ArrowRight,
  Play
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import TourCard from '../components/tours/TourCard';

const HomePage = () => {
  const [featuredTours, setFeaturedTours] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedTours();
  }, []);

  const fetchFeaturedTours = async () => {
    try {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('featured', true)
        .limit(6);

      if (error) throw error;
      setFeaturedTours(data || []);
    } catch (error) {
      console.error('Error fetching featured tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/tours?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const stats = [
    { icon: Users, label: 'Happy Travelers', value: '50,000+' },
    { icon: MapPin, label: 'Destinations', value: '200+' },
    { icon: Award, label: 'Awards Won', value: '25+' },
    { icon: Star, label: 'Average Rating', value: '4.9' },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Your payments and personal information are always protected with industry-leading security.',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Our dedicated support team is available around the clock to assist you with any questions.',
    },
    {
      icon: Award,
      title: 'Best Price Guarantee',
      description: 'We guarantee the best prices on all our tours. Find it cheaper elsewhere? We\'ll match it.',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video/Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Travel destination"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
          >
            Discover Your Next
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
              {' '}Adventure
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed"
          >
            Explore the world's most breathtaking destinations with our expertly crafted tours
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row max-w-2xl mx-auto mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Where do you want to go?"
                className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white/95 backdrop-blur-sm rounded-l-lg sm:rounded-r-none rounded-r-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-r-lg sm:rounded-l-none rounded-l-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>Search Tours</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Link
              to="/tours"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Explore Tours</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <button className="flex items-center space-x-2 text-white hover:text-primary-300 transition-colors duration-200">
              <Play className="h-5 w-5" />
              <span>Watch Video</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-primary-600 text-white rounded-full">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Tours
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover our most popular and highly-rated tours, carefully selected for unforgettable experiences
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-t-xl" />
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-b-xl">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-3" />
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3" />
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              to="/tours"
              className="inline-flex items-center space-x-2 btn-primary text-lg px-8 py-3"
            >
              <span>View All Tours</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose WanderLust?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We're committed to providing you with the best travel experiences through our premium services
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center p-8 rounded-xl bg-gray-50 dark:bg-gray-700 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-full">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-br from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stay Updated with Latest Tours
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Subscribe to our newsletter and be the first to know about new destinations and exclusive offers
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-l-lg sm:rounded-r-none rounded-r-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="bg-accent-500 hover:bg-accent-600 text-white px-8 py-3 rounded-r-lg sm:rounded-l-none rounded-l-lg font-semibold transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;