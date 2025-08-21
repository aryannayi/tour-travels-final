import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, CreditCard, CheckCircle, MapPin, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const BookingPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  
  const [bookingData, setBookingData] = useState({
    selectedDate: '',
    numberOfPeople: 1,
    specialRequests: '',
    contactNumber: '',
    emergencyContact: '',
  });

  useEffect(() => {
    if (id) {
      fetchTour();
    }
  }, [id]);

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
      toast.error('Failed to load tour details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    return tour ? tour.price * bookingData.numberOfPeople : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !tour) return;

    setSubmitting(true);
    try {
      console.log('Creating booking with data:', {
        user_id: user.id,
        tour_id: tour.id,
        booking_date: bookingData.selectedDate,
        number_of_people: bookingData.numberOfPeople,
        total_amount: calculateTotal(),
        status: 'pending',
        special_requests: bookingData.specialRequests,
      });

      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user.id,
            tour_id: tour.id,
            booking_date: bookingData.selectedDate,
            number_of_people: bookingData.numberOfPeople,
            total_amount: calculateTotal(),
            status: 'pending',
            special_requests: bookingData.specialRequests,
          },
        ])
        .select()
        .single();

      console.log('Booking insert result:', { data, error });

      if (error) throw error;

      // Add to cart for payment processing
      addToCart({
        tourId: tour.id,
        title: tour.title,
        price: tour.price,
        image: tour.images[0] || '',
        date: bookingData.selectedDate,
        people: bookingData.numberOfPeople,
      });

      toast.success('Booking created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Booking creation error:', error);
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!tour) return <div>Tour not found</div>;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Book Your Adventure
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Complete your booking for {tour.title}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-300'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                3
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Select Date & Group Size</span>
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tour Date
                      </label>
                      <input
                        type="date"
                        value={bookingData.selectedDate}
                        onChange={(e) => handleInputChange('selectedDate', e.target.value)}
                        min={today}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Number of People
                      </label>
                      <select
                        value={bookingData.numberOfPeople}
                        onChange={(e) => handleInputChange('numberOfPeople', parseInt(e.target.value))}
                        className="input-field"
                        required
                      >
                        {[...Array(tour.max_group_size)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i === 0 ? 'Person' : 'People'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full btn-primary"
                      disabled={!bookingData.selectedDate}
                    >
                      Continue
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Additional Information</span>
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        value={bookingData.contactNumber}
                        onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Emergency Contact
                      </label>
                      <input
                        type="text"
                        value={bookingData.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        placeholder="Emergency contact name and number"
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        value={bookingData.specialRequests}
                        onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                        placeholder="Any dietary restrictions, special occasions, or requests..."
                        rows={4}
                        className="input-field"
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 btn-outline"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex-1 btn-primary"
                        disabled={!bookingData.contactNumber || !bookingData.emergencyContact}
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Confirm Booking</span>
                    </h3>

                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tour Date:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(bookingData.selectedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Number of People:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {bookingData.numberOfPeople}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Price per person:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${tour.price}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-4 flex justify-between text-lg font-semibold">
                        <span className="text-gray-900 dark:text-white">Total Amount:</span>
                        <span className="text-primary-600 dark:text-primary-400">
                          ${calculateTotal()}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex-1 btn-outline"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 btn-primary flex items-center justify-center space-x-2"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4" />
                            <span>Confirm Booking</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Tour Summary */}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Tour Summary
                </h3>
                
                <img
                  src={tour.images?.[0] || 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt={tour.title}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {tour.title}
                </h4>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{tour.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{tour.duration} days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Max {tour.max_group_size} people</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    ₹{tour.price}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    per person
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Booking Protection
                </h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Free cancellation up to 24 hours before tour</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Instant confirmation via email</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Secure payment processing</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>24/7 customer support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingPage;