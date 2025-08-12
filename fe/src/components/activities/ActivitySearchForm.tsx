'use client';

import { useState } from 'react';
import { ActivityCategory, CityActivityStats } from '@/graphql/types';

interface ActivitySearchFormProps {
  onSearch: (params: SearchParams, mode: 'city' | 'keyword') => void;
  categories: ActivityCategory[];
  cityStats: CityActivityStats[];
  initialParams: SearchParams;
}

interface SearchParams {
  city: string;
  keyword: string;
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  difficulty: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

export default function ActivitySearchForm({ 
  onSearch, 
  categories, 
  cityStats, 
  initialParams 
}: ActivitySearchFormProps) {
  const [searchMode, setSearchMode] = useState<'city' | 'keyword'>('city');
  const [formData, setFormData] = useState<SearchParams>(initialParams);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const cities = cityStats.map(stat => `${stat.city}, ${stat.country}`);
  const filteredCities = cities.filter(city => 
    city.toLowerCase().includes(formData.city.toLowerCase())
  ).slice(0, 5);

  const handleInputChange = (field: keyof SearchParams, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'city') {
      setShowCitySuggestions(value.length > 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchMode === 'city' && !formData.city.trim()) {
      alert('Please enter a city name');
      return;
    }
    
    if (searchMode === 'keyword' && !formData.keyword.trim()) {
      alert('Please enter a search keyword');
      return;
    }

    onSearch(formData, searchMode);
    setShowCitySuggestions(false);
  };

  const handleCitySelect = (city: string) => {
    const cityName = city.split(',')[0].trim();
    setFormData(prev => ({ ...prev, city: cityName }));
    setShowCitySuggestions(false);
  };

  const clearSearch = () => {
    setFormData({
      city: '',
      keyword: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      difficulty: '',
      sortBy: 'name',
      sortOrder: 'ASC'
    });
    setShowCitySuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Search Mode Toggle */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setSearchMode('city')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              searchMode === 'city'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Search by City
          </button>
          <button
            type="button"
            onClick={() => setSearchMode('keyword')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              searchMode === 'keyword'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Search by Keyword
          </button>
        </div>
      </div>

      {/* Main Search Input */}
      <div className="relative">
        {searchMode === 'city' ? (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Enter city name (e.g., Rishikesh, Mumbai, Dubai)"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              onFocus={() => setShowCitySuggestions(formData.city.length > 0)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* City Suggestions */}
            {showCitySuggestions && filteredCities.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                {filteredCities.map((city, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleCitySelect(city)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search activities (e.g., trekking, diving, cultural tour)"
              value={formData.keyword}
              onChange={(e) => handleInputChange('keyword', e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={formData.categoryId}
            onChange={(e) => handleInputChange('categoryId', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Min Price
          </label>
          <input
            type="number"
            id="minPrice"
            placeholder="0"
            value={formData.minPrice}
            onChange={(e) => handleInputChange('minPrice', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Max Price
          </label>
          <input
            type="number"
            id="maxPrice"
            placeholder="10000"
            value={formData.maxPrice}
            onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Difficulty */}
        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty
          </label>
          <select
            id="difficulty"
            value={formData.difficulty}
            onChange={(e) => handleInputChange('difficulty', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any Level</option>
            <option value="Easy">Easy</option>
            <option value="Moderate">Moderate</option>
            <option value="Challenging">Challenging</option>
            <option value="Expert">Expert</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Search Activities
        </button>
        <button
          type="button"
          onClick={clearSearch}
          className="sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Clear
        </button>
      </div>
    </form>
  );
}