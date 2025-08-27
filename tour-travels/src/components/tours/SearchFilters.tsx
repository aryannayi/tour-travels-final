import React, { useState } from 'react';
import { Search, Filter, MapPin, DollarSign, Clock, Users } from 'lucide-react';

interface SearchFiltersProps {
  onSearchChange: (search: string) => void;
  onFiltersChange: (filters: any) => void;
  initialFilters?: any;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  onSearchChange, 
  onFiltersChange, 
  initialFilters = {} 
}) => {
  const [search, setSearch] = useState(initialFilters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: initialFilters.location || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    duration: initialFilters.duration || '',
    difficulty: initialFilters.difficulty || '',
    category: initialFilters.category || '',
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      location: '',
      minPrice: '',
      maxPrice: '',
      duration: '',
      difficulty: '',
      category: '',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search tours by name, location, or description..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
        
        {(filters.location || filters.minPrice || filters.maxPrice || filters.duration || filters.difficulty || filters.category) && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Location
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="input-field"
            >
              <option value="">All Locations</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="Africa">Africa</option>
              <option value="North America">North America</option>
              <option value="South America">South America</option>
              <option value="Oceania">Oceania</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Price Range
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="Min"
                className="input-field"
              />
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="Max"
                className="input-field"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Duration
            </label>
            <select
              value={filters.duration}
              onChange={(e) => handleFilterChange('duration', e.target.value)}
              className="input-field"
            >
              <option value="">Any Duration</option>
              <option value="1-3">1-3 days</option>
              <option value="4-7">4-7 days</option>
              <option value="8-14">8-14 days</option>
              <option value="15+">15+ days</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="input-field"
            >
              <option value="">Any Difficulty</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="challenging">Challenging</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              <option value="Adventure">Adventure</option>
              <option value="Cultural">Cultural</option>
              <option value="Wildlife">Wildlife</option>
              <option value="Beach">Beach</option>
              <option value="Mountain">Mountain</option>
              <option value="City">City</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;