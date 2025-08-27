import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Mail,
  Phone,
  Eye,
  Edit
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          tours (title, location, images),
          users (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;
      
      toast.success(`Booking ${status} successfully!`);
      fetchBookings();
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

  const filteredBookings = bookings.filter((booking: any) => {
    const matchesSearch = 
      booking.tours?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.users?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.users?.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === '' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
            Manage Bookings
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            View and manage all tour bookings
          </p>
        </motion.div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by tour, user name, or email..."
                className="input-field pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tour Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4">
                        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded" />
                      </td>
                    </tr>
                  ))
                ) : filteredBookings.length > 0 ? (
                  filteredBookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">
                            Booking #{booking.id.slice(0, 8)}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{booking.number_of_people} people</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {booking.users?.full_name}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{booking.users?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <img
                            src={booking.tours?.images?.[0] || 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=100'}
                            alt={booking.tours?.title}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {booking.tours?.title}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{booking.tours?.location}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-primary-600 dark:text-primary-400 flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{booking.total_amount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                          className={`text-sm px-3 py-1 rounded-full border-0 font-medium ${getStatusColor(booking.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;