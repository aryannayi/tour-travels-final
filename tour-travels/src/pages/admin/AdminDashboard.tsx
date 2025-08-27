import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTours: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [toursResult, bookingsResult, usersResult] = await Promise.all([
        supabase.from('tours').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*, total_amount'),
        supabase.from('users').select('*', { count: 'exact', head: true }),
      ]);

      const totalRevenue = bookingsResult.data?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0;

      setStats({
        totalTours: toursResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalRevenue,
      });

      // Fetch recent bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          *,
          tours (title, location),
          users (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentBookings(bookings || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Tours',
      value: stats.totalTours,
      icon: MapPin,
      color: 'bg-primary-500',
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'bg-secondary-500',
      change: '+8%',
      trend: 'up',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-accent-500',
      change: '+15%',
      trend: 'up',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+23%',
      trend: 'up',
    },
  ];

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Manage your tours, bookings, and users
              </p>
            </div>
            <Link
              to="/admin/tours"
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Tour</span>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <div className="flex items-center space-x-1 mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Bookings
              </h2>
              <Link
                to="/admin/bookings"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-lg" />
                ))}
              </div>
            ) : recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {booking.tours?.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {booking.users?.full_name} • {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">
                        ${booking.total_amount}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                No bookings yet
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="card p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h2>

            <div className="space-y-4">
              <Link
                to="/admin/tours"
                className="w-full flex items-center space-x-3 p-4 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors duration-200"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Add New Tour</span>
              </Link>

              <Link
                to="/admin/bookings"
                className="w-full flex items-center space-x-3 p-4 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-900/30 transition-colors duration-200"
              >
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Manage Bookings</span>
              </Link>

              <Link
                to="/admin/users"
                className="w-full flex items-center space-x-3 p-4 bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 rounded-lg hover:bg-accent-100 dark:hover:bg-accent-900/30 transition-colors duration-200"
              >
                <Users className="h-5 w-5" />
                <span className="font-medium">Manage Users</span>
              </Link>

              <Link
                to="/tours"
                className="w-full flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <Eye className="h-5 w-5" />
                <span className="font-medium">Preview Website</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;