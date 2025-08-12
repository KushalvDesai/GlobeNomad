'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import { 
  GET_ACTIVITIES_BY_CITY, 
  SEARCH_ACTIVITIES, 
  GET_ACTIVITY_CATEGORIES,
  GET_CITY_ACTIVITY_STATS 
} from '@/graphql/queries';
import { ADD_STOP_TO_TRIP } from '@/graphql/mutations';
import { 
  Activity, 
  ActivityCategory, 
  CityActivityStats,
  ActivityFiltersInput,
  AddStopToTripInput
} from '@/graphql/types';
import ActivityCard from '@/components/activities/ActivityCard';
import ActivityFilters from '@/components/activities/ActivityFilters';
import ActivitySearch from '@/components/activities/ActivitySearch';
import CitySelector from '@/components/activities/CitySelector';
import { Loader2, MapPin, Filter, Search } from 'lucide-react';

export default function ActivitiesPage() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get('tripId');
  const cityFromUrl = searchParams.get('city');
  const dayFromUrl = searchParams.get('day'); // Add this to get day from URL
  const [selectedCity, setSelectedCity] = useState<string>(cityFromUrl || '');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [difficulty, setDifficulty] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Add mutation for adding activities to trip
  const [addStopToTrip] = useMutation(ADD_STOP_TO_TRIP);

  // Get city stats for city selector
  const { data: cityStatsData } = useQuery(GET_CITY_ACTIVITY_STATS);
  
  // Get activity categories for filters
  const { data: categoriesData } = useQuery(GET_ACTIVITY_CATEGORIES);

  // Main activities query - either by city or search
  const shouldSearchByCity = selectedCity && !searchKeyword;
  const shouldSearchByKeyword = searchKeyword;

  // Create filters object for backend
  const filters: ActivityFiltersInput = {
    category: selectedCategory || undefined,
    minPrice,
    maxPrice,
    fitnessLevel: difficulty || undefined,
    sortBy,
    sortOrder: sortOrder.toLowerCase(),
    limit: 20,
    offset: 0,
  };

  const { 
    data: cityActivitiesData, 
    loading: cityLoading, 
    error: cityError 
  } = useQuery(GET_ACTIVITIES_BY_CITY, {
    variables: {
      city: selectedCity,
      filters: filters
    },
    skip: !shouldSearchByCity,
  });

  const { 
    data: searchActivitiesData, 
    loading: searchLoading, 
    error: searchError 
  } = useQuery(SEARCH_ACTIVITIES, {
    variables: {
      searchTerm: searchKeyword,
      filters: filters
    },
    skip: !shouldSearchByKeyword,
  });

  const activities: Activity[] = shouldSearchByKeyword 
    ? searchActivitiesData?.searchActivities || []
    : cityActivitiesData?.getActivitiesByCity || [];

  const loading = cityLoading || searchLoading;
  const error = cityError || searchError;
  const total = activities.length; // Since backend returns arrays, use array length

  const cityStats: CityActivityStats[] = cityStatsData?.getCityActivityStats || [];
  const categories: ActivityCategory[] = categoriesData?.getActivityCategories || [];

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSearchKeyword(''); // Clear search when selecting city
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setDifficulty('');
    setSortBy('name');
    setSortOrder('ASC');
  };

  const handleAddToTrip = async (activity: Activity) => {
    if (!tripId) return;

    try {
      const selectedDay = dayFromUrl ? parseInt(dayFromUrl) : 1; // Use selected day or default to 1
      
      const addStopInput: AddStopToTripInput = {
        tripId,
        day: selectedDay, // Use the selected day
        order: 1, // Default order, will be adjusted by backend
        stop: {
          name: activity.name,
          description: activity.description,
          city: activity.location.city,
          country: activity.location.country,
          latitude: activity.location.latitude,
          longitude: activity.location.longitude,
          address: activity.location.address,
          estimatedCost: activity.pricing.basePrice,
          type: activity.category.name,
          estimatedDuration: activity.duration
        }
      };

      await addStopToTrip({
        variables: { addStopInput }
      });

      // Show success message with day information
      alert(`Activity added to Day ${selectedDay} of your trip!`);
    } catch (error) {
      console.error('Error adding activity to trip:', error);
      alert('Failed to add activity to trip. Please try again.');
    }
  };

  // Add useEffect to handle city from itinerary
  useEffect(() => {
    if (cityFromUrl && !selectedCity) {
      setSelectedCity(cityFromUrl);
    }
  }, [cityFromUrl, selectedCity]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="card border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                Discover Activities
              </h1>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="button-primary flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>

            {/* Search and City Selector */}
            <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1">
                <ActivitySearch 
                  onSearch={handleSearch}
                  placeholder="Search activities by keyword..."
                  value={searchKeyword}
                />
              </div>
              <div className="lg:w-80">
                <CitySelector
                  cities={cityStats}
                  selectedCity={selectedCity}
                  onCityChange={handleCityChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-80">
              <ActivityFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                minPrice={minPrice}
                onMinPriceChange={setMinPrice}
                maxPrice={maxPrice}
                onMaxPriceChange={setMaxPrice}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                onClearFilters={clearFilters}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2" style={{ color: 'var(--muted-foreground)' }}>
                <MapPin className="w-5 h-5" />
                <span>
                  {selectedCity && `${selectedCity} • `}
                  {total} {total === 1 ? 'activity' : 'activities'} found
                  {searchKeyword && ` for "${searchKeyword}"`}
                </span>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-1)' }} />
                <span className="ml-2" style={{ color: 'var(--muted-foreground)' }}>Loading activities...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="card border-red-500 p-6 text-center">
                <p className="text-red-400">
                  Error loading activities: {error.message}
                </p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && activities.length === 0 && (
              <div className="card card-hover p-12 text-center">
                <Search className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  No activities found
                </h3>
                <p className="mb-4" style={{ color: 'var(--muted-foreground)' }}>
                  {selectedCity || searchKeyword 
                    ? "Try adjusting your search criteria or filters"
                    : "Select a city or search for activities to get started"
                  }
                </p>
                {(selectedCity || searchKeyword) && (
                  <button
                    onClick={() => {
                      setSelectedCity('');
                      setSearchKeyword('');
                      clearFilters();
                    }}
                    className="button-primary px-4 py-2 rounded-lg transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Activities Grid */}
            {!loading && !error && activities.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((activity) => (
                  <ActivityCard 
                    key={activity.id} 
                    activity={activity} 
                    tripId={tripId}
                    onAddToTrip={handleAddToTrip}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}