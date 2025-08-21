import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  Heart, 
  CreditCard, 
  Settings,
  MapPin,
  Clock,
  Star,
  Eye,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user, userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cartItems, removeFromCart, clearCart } = useCart();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    phone: userProfile?.phone || '',
    address: userProfile?.address || ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchWishlist();
    }
  }, [user]);

  // Update profile form when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        phone: userProfile.phone || '',
        address: userProfile.address || ''
      });
    }
  }, [userProfile]);

  // Reflect tab from URL and update URL on tab changes
  useEffect(() => {
    const initialTab = searchParams.get('tab');
    if (initialTab && ['bookings', 'wishlist', 'cart', 'profile'].includes(initialTab)) {
      setActiveTab(initialTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const current = searchParams.get('tab');
    if (current !== activeTab) {
      const next = new URLSearchParams(searchParams);
      next.set('tab', activeTab);
      setSearchParams(next);
    }
  }, [activeTab, searchParams, setSearchParams]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          tours (title, location, images, duration)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          tours (id, title, location, price, images, duration)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlist(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const removeFromWishlist = async (tourId: string) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user?.id)
        .eq('tour_id', tourId);

      if (error) throw error;
      
      setWishlist(prev => prev.filter((item: any) => item.tours?.id !== tourId));
      toast.success('Removed from wishlist');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    console.log('Updating profile for user:', user.id);
    console.log('Profile data:', profileForm);
    console.log('Current user object:', user);

    setUpdatingProfile(true);
    try {
      // First, let's check what users exist in the database
      const { data: existingUsers, error: fetchError } = await supabase
        .from('users')
        .select('*');
      
      console.log('Existing users in database:', existingUsers);
      if (fetchError) console.error('Error fetching users:', fetchError);

      const { data, error } = await supabase
        .from('users')
        .update({
          phone: profileForm.phone,
          address: profileForm.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      console.log('Update response:', { data, error });

      if (error) throw error;

      // Update local state
      toast.success('Profile updated successfully!');
      
      // Refresh user profile data
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const tabs = [
    { id: 'bookings', name: 'My Bookings', icon: Calendar },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'cart', name: 'Cart', icon: CreditCard },
    { id: 'profile', name: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {userProfile?.full_name}!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Manage your bookings, wishlist, and profile settings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {userProfile?.full_name?.charAt(0) || 'U'}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {userProfile?.full_name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                    {tab.id === 'cart' && cartItems.length > 0 && (
                      <span className="bg-accent-500 text-white text-xs rounded-full px-2 py-1 ml-auto">
                        {cartItems.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* My Bookings */}
            {activeTab === 'bookings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-8"
              >
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  My Bookings
                </h2>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-24 rounded-lg" />
                    ))}
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-6">
                    {bookings.map((booking: any) => {
                      // Defensive check for tour data
                      if (!booking.tours) {
                        console.warn('Booking missing tour data:', booking);
                        return null;
                      }
                      
                      return (
                        <div key={booking.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <img
                                src={booking.tours.images?.[0] || 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=200'}
                                alt={booking.tours.title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {booking.tours.title}
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{booking.tours.location}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{booking.tours.duration} days</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Date:</span>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {new Date(booking.booking_date).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">People:</span>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {booking.number_of_people}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Total:</span>
                            <div className="font-medium text-primary-600 dark:text-primary-400">
                              ${booking.total_amount}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Booked:</span>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {new Date(booking.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No bookings yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Start exploring our amazing tours and make your first booking!
                    </p>
                    <Link to="/tours" className="btn-primary">
                      Browse Tours
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* Wishlist */}
            {activeTab === 'wishlist' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-8"
              >
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  My Wishlist
                </h2>

                {wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wishlist.map((item: any) => {
                      // Defensive check for tour data
                      if (!item.tours) {
                        console.warn('Wishlist item missing tour data:', item);
                        return null;
                      }
                      
                      return (
                        <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <img
                            src={item.tours.images?.[0] || 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=400'}
                            alt={item.tours.title}
                            className="w-full h-32 object-cover rounded-lg mb-4"
                          />
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {item.tours.title}
                          </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{item.tours.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{item.tours.duration} days</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            ${item.tours.price}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/tours/${item.tours.id}`}
                              className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900 rounded-lg transition-colors duration-200"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => removeFromWishlist(item.tours.id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No favorites yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Start exploring tours and add them to your wishlist!
                    </p>
                    <Link to="/tours" className="btn-primary">
                      Browse Tours
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* Cart */}
            {activeTab === 'cart' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-8"
              >
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Shopping Cart
                </h2>

                {cartItems.length > 0 ? (
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div key={item.tourId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {item.title}
                              </h3>
                              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <div>Date: {new Date(item.date).toLocaleDateString()}</div>
                                <div>People: {item.people}</div>
                                <div>Price: ${item.price} per person</div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                              ₹{item.price * item.people}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.tourId)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm mt-2"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-xl font-semibold text-gray-900 dark:text-white">
                          Total: ₹{cartItems.reduce((total, item) => total + (item.price * item.people), 0)}
                        </span>
                        <button
                          onClick={clearCart}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                        >
                          Clear Cart
                        </button>
                      </div>
                      <button className="w-full btn-primary">
                        Proceed to Payment
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Add some tours to your cart to see them here
                    </p>
                    <Link to="/tours" className="btn-primary">
                      Browse Tours
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* Profile */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-8"
              >
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Profile Settings
                </h2>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={userProfile?.full_name || ''}
                        className="input-field"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="input-field"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Add your phone number"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address
                    </label>
                    <textarea
                      value={profileForm.address}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Add your address"
                      rows={3}
                      className="input-field"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={updatingProfile}
                  >
                    {updatingProfile ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;