import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import TourCard from '../components/tours/TourCard';
import SearchFilters from '../components/tours/SearchFilters';
import Pagination from '../components/ui/Pagination';

const ToursPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tours, setTours] = useState([]);
  const [wishlistedTours, setWishlistedTours] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toursPerPage = 9;

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    duration: searchParams.get('duration') || '',
    difficulty: searchParams.get('difficulty') || '',
    category: searchParams.get('category') || '',
  });

  useEffect(() => {
    fetchTours();
    fetchWishlist();
  }, [currentPage, filters]);

  const fetchTours = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('tours')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.minPrice) {
        query = query.gte('price', parseInt(filters.minPrice));
      }
      if (filters.maxPrice) {
        query = query.lte('price', parseInt(filters.maxPrice));
      }
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.duration) {
        const [min, max] = filters.duration.includes('+') 
          ? [parseInt(filters.duration), 999]
          : filters.duration.split('-').map(Number);
        query = query.gte('duration', min);
        if (max !== 999) query = query.lte('duration', max);
      }

      // Apply pagination
      const from = (currentPage - 1) * toursPerPage;
      const to = from + toursPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setTours(data || []);
      setTotalPages(Math.ceil((count || 0) / toursPerPage));
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    // This would fetch user's wishlist if logged in
    // For now, we'll simulate it
    setWishlistedTours([]);
  };

  const handleSearchChange = (search: string) => {
    const newFilters = { ...filters, search };
    setFilters(newFilters);
    updateSearchParams(newFilters);
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
    updateSearchParams({ ...filters, ...newFilters });
    setCurrentPage(1);
  };

  const updateSearchParams = (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value as string);
    });
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Tours
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Find your perfect adventure from our collection of amazing tours
          </p>
        </motion.div>

        {/* Search and Filters */}
        <SearchFilters
          onSearchChange={handleSearchChange}
          onFiltersChange={handleFiltersChange}
          initialFilters={filters}
        />

        {/* Tours Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, i) => (
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
        ) : tours.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  isWishlisted={wishlistedTours.includes(tour.id)}
                  onWishlistChange={fetchWishlist}
                />
              ))}
            </div>
            
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🏝️</div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No tours found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search criteria or browse all tours
            </p>
            <button
              onClick={() => {
                setFilters({
                  search: '',
                  location: '',
                  minPrice: '',
                  maxPrice: '',
                  duration: '',
                  difficulty: '',
                  category: '',
                });
                setSearchParams(new URLSearchParams());
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ToursPage;