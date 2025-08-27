import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Heart,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface TourCardProps {
  tour: {
    id: string;
    title: string;
    description: string;
    price: number;
    duration: number;
    location: string;
    images: string[];
    featured: boolean;
    max_group_size: number;
    difficulty: string;
  };
  isWishlisted?: boolean;
  onWishlistChange?: () => void;
}

const TourCard: React.FC<TourCardProps> = ({ tour, isWishlisted = false, onWishlistChange }) => {
  const { user } = useAuth();
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    setWishlistLoading(true);

    try {
      if (isWishlisted) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('tour_id', tour.id);

        if (error) throw error;
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlists')
          .insert([
            {
              user_id: user.id,
              tour_id: tour.id,
            },
          ]);

        if (error) throw error;
        toast.success('Added to wishlist');
      }

      onWishlistChange?.();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setWishlistLoading(false);
    }
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    challenging: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card overflow-hidden group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={tour.images[0] || 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={tour.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Wishlist button */}
        {user && (
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
              isWishlisted 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Featured badge */}
        {tour.featured && (
          <div className="absolute top-3 left-3 bg-accent-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>Featured</span>
          </div>
        )}

        {/* Difficulty badge */}
        <div className={`absolute bottom-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[tour.difficulty as keyof typeof difficultyColors]}`}>
          {tour.difficulty}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
            {tour.title}
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              ${tour.price}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">per person</div>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
          {tour.description}
        </p>

        {/* Tour details */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>{tour.duration} days</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <Users className="h-4 w-4" />
            <span>Max {tour.max_group_size}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{tour.location}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">4.5 (12 reviews)</span>
        </div>

        {/* Action button */}
        <Link
          to={`/tours/${tour.id}`}
          className="w-full btn-primary text-center block"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default TourCard;