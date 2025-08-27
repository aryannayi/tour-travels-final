import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Star
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const AdminTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    location: '',
    category: '',
    max_group_size: '',
    difficulty: 'easy',
    featured: false,
    images: [''],
    available_dates: [''],
  });

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTours(data || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      duration: '',
      location: '',
      category: '',
      max_group_size: '',
      difficulty: 'easy',
      featured: false,
      images: [''],
      available_dates: [''],
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].map((item: string, i: number) => 
        i === index ? value : item
      ),
    }));
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field as keyof typeof prev], ''],
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent, isEdit = false) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const tourData = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        max_group_size: parseInt(formData.max_group_size),
        images: formData.images.filter(img => img.trim() !== ''),
        available_dates: formData.available_dates.filter(date => date.trim() !== ''),
      };

      if (isEdit && selectedTour) {
        const { error } = await supabase
          .from('tours')
          .update(tourData)
          .eq('id', selectedTour.id);

        if (error) throw error;
        toast.success('Tour updated successfully!');
        setShowEditModal(false);
      } else {
        const { error } = await supabase
          .from('tours')
          .insert([tourData]);

        if (error) throw error;
        toast.success('Tour created successfully!');
        setShowAddModal(false);
      }

      resetForm();
      setSelectedTour(null);
      fetchTours();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (tour: any) => {
    setSelectedTour(tour);
    setFormData({
      title: tour.title,
      description: tour.description,
      price: tour.price.toString(),
      duration: tour.duration.toString(),
      location: tour.location,
      category: tour.category || '',
      max_group_size: tour.max_group_size.toString(),
      difficulty: tour.difficulty,
      featured: tour.featured,
      images: tour.images?.length > 0 ? tour.images : [''],
      available_dates: tour.available_dates?.length > 0 ? tour.available_dates : [''],
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tour?')) return;

    try {
      const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Tour deleted successfully!');
      fetchTours();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredTours = tours.filter((tour: any) =>
    tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tour.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TourForm = ({ isEdit }: { isEdit: boolean }) => (
    <form onSubmit={(e) => handleSubmit(e, isEdit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tour Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="input-field"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="input-field"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Price ($)
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Duration (days)
          </label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Group Size
          </label>
          <input
            type="number"
            value={formData.max_group_size}
            onChange={(e) => handleInputChange('max_group_size', e.target.value)}
            className="input-field"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="input-field"
            required
          >
            <option value="">Select Category</option>
            <option value="Adventure">Adventure</option>
            <option value="Cultural">Cultural</option>
            <option value="Wildlife">Wildlife</option>
            <option value="Beach">Beach</option>
            <option value="Mountain">Mountain</option>
            <option value="City">City</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => handleInputChange('difficulty', e.target.value)}
            className="input-field"
          >
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="challenging">Challenging</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="featured"
          checked={formData.featured}
          onChange={(e) => handleInputChange('featured', e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Featured Tour
        </label>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tour Images (URLs)
        </label>
        <div className="space-y-2">
          {formData.images.map((image, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="url"
                value={image}
                onChange={(e) => handleArrayChange('images', index, e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="input-field flex-1"
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('images', index)}
                  className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('images')}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
          >
            + Add Image
          </button>
        </div>
      </div>

      {/* Available Dates */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Available Dates
        </label>
        <div className="space-y-2">
          {formData.available_dates.map((date, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="date"
                value={date}
                onChange={(e) => handleArrayChange('available_dates', index, e.target.value)}
                className="input-field flex-1"
              />
              {formData.available_dates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('available_dates', index)}
                  className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('available_dates')}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
          >
            + Add Date
          </button>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => {
            isEdit ? setShowEditModal(false) : setShowAddModal(false);
            resetForm();
            setSelectedTour(null);
          }}
          className="flex-1 btn-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 btn-primary"
        >
          {submitting ? 'Saving...' : isEdit ? 'Update Tour' : 'Create Tour'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Manage Tours
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Add, edit, and manage your tour offerings
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Tour</span>
          </button>
        </motion.div>

        {/* Search */}
        <div className="card p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tours by title or location..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Tours Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
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
                      <td colSpan={5} className="px-6 py-4">
                        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded" />
                      </td>
                    </tr>
                  ))
                ) : filteredTours.length > 0 ? (
                  filteredTours.map((tour: any) => (
                    <tr key={tour.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <img
                            src={tour.images?.[0] || 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=100'}
                            alt={tour.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {tour.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{tour.location}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white space-y-1">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span>{tour.duration} days</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3 text-gray-400" />
                            <span>Max {tour.max_group_size}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              tour.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              tour.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {tour.difficulty}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          ${tour.price}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {tour.featured && (
                            <span className="bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                              <Star className="h-3 w-3" />
                              <span>Featured</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(tour)}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tour.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No tours found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Tour Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
          title="Add New Tour"
          size="xl"
        >
          <TourForm isEdit={false} />
        </Modal>

        {/* Edit Tour Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            resetForm();
            setSelectedTour(null);
          }}
          title="Edit Tour"
          size="xl"
        >
          <TourForm isEdit={true} />
        </Modal>
      </div>
    </div>
  );
};

export default AdminTours;