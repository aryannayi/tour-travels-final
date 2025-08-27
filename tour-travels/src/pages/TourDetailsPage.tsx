import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  Shield,
  Award,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const TourDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [tour, setTour] = useState<any>(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTour();
      fetchReviews();
      checkWishlist();
    }
  }, [id, user]);

  const fetchTour = async () => {
    try {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTour(data);
    } catch (error) {
      console.error('Error fetching tour:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users (full_name, avatar_url)
        `)
        .eq('tour_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkWishlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('tour_id', id)
        .single();

      setIsWishlisted(!!data);
    } catch (error) {
      // Not in wishlist
    }
  };

  const toggleWishlist = async () => {
    if (!user) return;

    try {
      if (isWishlisted) {
        await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('tour_id', id);
      } else {
        await supabase
          .from('wishlists')
          .insert([{ user_id: user.id, tour_id: id }]);
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!tour) return <div>Tour not found</div>;

  const images = tour.images?.length > 0 ? tour.images : [
    'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=800'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          to="/tours"
          className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Tours</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="card overflow-hidden">
              <div className="relative h-96">
                <img
                  src={images[currentImageIndex]}
                  alt={tour.title}
                  className="w-full h-full object-cover"
                />
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => 
                        prev === 0 ? images.length - 1 : prev - 1
                      )}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-200"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => 
                        (prev + 1) % images.length
                      )}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-200"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex space-x-2 p-4 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                        index === currentImageIndex 
                          ? 'border-primary-500' 
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${tour.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tour Details */}
            <div className="card p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {tour.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{tour.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>4.5 (12 reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {user && (
                    <button
                      onClick={toggleWishlist}
                      className={`p-3 rounded-full transition-colors duration-200 ${
                        isWishlisted
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  )}
                  <button className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                  <div className="font-semibold text-gray-900 dark:text-white">{tour.duration} Days</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Users className="h-6 w-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                  <div className="font-semibold text-gray-900 dark:text-white">Max {tour.max_group_size}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Group Size</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Award className="h-6 w-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                  <div className="font-semibold text-gray-900 dark:text-white capitalize">{tour.difficulty}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Difficulty</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                  <div className="font-semibold text-gray-900 dark:text-white">Insured</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Safety</div>
                </div>
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Tour Description
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {tour.description}
                </p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  What's Included
                </h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mb-6">
                  <li>Professional tour guide</li>
                  <li>Transportation during the tour</li>
                  <li>Accommodation (where applicable)</li>
                  <li>Entrance fees to attractions</li>
                  <li>Travel insurance</li>
                  <li>24/7 customer support</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Available Dates
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {tour.available_dates?.slice(0, 6).map((date: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(date).toLocaleDateString()}
                      </span>
                    </div>
                  )) || (
                    <div className="col-span-full text-gray-600 dark:text-gray-400">
                      Available dates will be updated soon
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="card p-8">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Reviews & Ratings
              </h3>
              
              <div className="flex items-center space-x-4 mb-8">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">4.5</div>
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                      />
                    ))}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Based on 12 reviews</div>
                </div>
              </div>

              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                          {review.users?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {review.users?.full_name || 'Anonymous'}
                            </span>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    No reviews yet. Be the first to review this tour!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="card p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                  ${tour.price}
                </div>
                <div className="text-gray-600 dark:text-gray-400">per person</div>
              </div>

              <Link
                to={`/booking/${tour.id}`}
                className="w-full btn-primary text-center block mb-4 text-lg py-3"
              >
                Book This Tour
              </Link>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                Free cancellation up to 24 hours before the tour
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Instant confirmation</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Mobile voucher accepted</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Small group experience</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">✓</span>
                </div>
              </div>
            </div>

            {/* Tour Highlights */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tour Highlights
              </h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
                  <span>Expert local guide with extensive knowledge</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
                  <span>Small group size for personalized experience</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
                  <span>All entrance fees and permits included</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
                  <span>Comprehensive travel insurance coverage</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
                  <span>Professional photography opportunities</span>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Need Help?
              </h3>
              <div className="space-y-3 text-sm">
                <div className="text-gray-600 dark:text-gray-300">
                  Have questions about this tour? Our travel experts are here to help.
                </div>
                <Link
                  to="/contact"
                  className="block text-center btn-outline w-full"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailsPage;