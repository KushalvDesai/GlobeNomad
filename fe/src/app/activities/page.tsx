'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  GET_ACTIVITIES_BY_CITY, 
  SEARCH_ACTIVITIES, 
  GET_ACTIVITY_CATEGORIES,
  GET_CITY_ACTIVITY_STATS 
} from '@/graphql/queries';
import { ADD_STOP_TO_TRIP, CREATE_TRIP } from '@/graphql/mutations';
import { 
  Activity, 
  ActivityCategory, 
  CityActivityStats,
  ActivityFiltersInput,
  AddStopToTripInput,
  CreateTripInput
} from '@/graphql/types';
import ActivityCard from '@/components/activities/ActivityCard';
import ActivityFilters from '@/components/activities/ActivityFilters';
import ActivitySearch from '@/components/activities/ActivitySearch';
import CitySelector from '@/components/activities/CitySelector';
import { Loader2, MapPin, Filter, Search, Settings, User, LogOut } from 'lucide-react';
import Header from '@/components/ui/Header';

export default function ActivitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get('tripId');
  const cityFromUrl = searchParams.get('city');
  const dayFromUrl = searchParams.get('day');
  const [selectedCity, setSelectedCity] = useState<string>(cityFromUrl || '');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [difficulty, setDifficulty] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Add mutations
  const [addStopToTrip] = useMutation(ADD_STOP_TO_TRIP);
  const [createTrip] = useMutation(CREATE_TRIP);

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
  const total = activities.length;

  const cityStats: CityActivityStats[] = cityStatsData?.getCityActivityStats || [];
  const categories: ActivityCategory[] = categoriesData?.getActivityCategories || [];

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSearchKeyword('');
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

  const handleLogout = () => {
    localStorage.removeItem("gn_token");
    document.cookie = "gn_token=; path=/; max-age=0";
    router.push("/login");
  };

  const handleAddToTrip = async (activity: Activity) => {
    if (!tripId) return;

    try {
      const selectedDay = dayFromUrl ? parseInt(dayFromUrl) : 1;
      
      const addStopInput: AddStopToTripInput = {
        tripId,
        day: selectedDay,
        order: 1,
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

      alert(`Activity added to Day ${selectedDay} of your trip!`);
    } catch (error) {
      console.error('Error adding activity to trip:', error);
      alert('Failed to add activity to trip. Please try again.');
    }
  };

  // New function to handle activity click - create trip with activity
  const handleActivityClick = async (activity: Activity) => {
    try {
      // Create a new trip with the activity's city as destination
      const createTripInput: CreateTripInput = {
        title: `Trip to ${activity.location.city}`,
        description: `Explore ${activity.location.city} starting with ${activity.name}`,
        startDate: new Date().toISOString().split('T')[0], // Today's date
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        currency: 'INR'
      };

      const { data } = await createTrip({
        variables: { createTripInput }
      });

      if (data?.createTrip?.id) {
        // Navigate to the itinerary page with the activity and city info
        const params = new URLSearchParams();
        params.set('firstCity', activity.location.city);
        params.set('startDate', createTripInput.startDate || '');
        params.set('activityId', activity.id);
        params.set('activityName', activity.name);
        params.set('activityDescription', activity.description || '');
        params.set('activityPrice', activity.pricing?.basePrice?.toString() || '0');
        params.set('activityCurrency', activity.pricing?.currency || 'INR');
        params.set('activityDuration', activity.duration?.toString() || '120');
        params.set('activityCategory', activity.category?.name || 'Activity');
        
        router.push(`/trip/${data.createTrip.id}/itinerary?${params.toString()}`);
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Failed to create trip. Please try again.');
    }
  };

  useEffect(() => {
    if (cityFromUrl && !selectedCity) {
      setSelectedCity(cityFromUrl);
    }
  }, [cityFromUrl, selectedCity]);

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB]">
      <Header />

      {/* Page Header */}
      <div className="border-b border-[#2a2a35] bg-[#0f0f17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-[#E6E8EB]">
                Discover Activities
              </h1>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 rounded-lg bg-[#27C3FF]/20 border border-[#27C3FF]/30 text-[#E6E8EB] hover:bg-[#27C3FF]/30 transition-colors flex items-center space-x-2"
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
              <div className="flex items-center space-x-2 text-[#9AA0A6]">
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
                <Loader2 className="w-8 h-8 animate-spin text-[#27C3FF]" />
                <span className="ml-2 text-[#9AA0A6]">Loading activities...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-[#0f0f17] border border-red-500/20 rounded-lg p-6 text-center">
                <p className="text-red-400">
                  Error loading activities: {error.message}
                </p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && activities.length === 0 && (
              <div className="bg-[#0f0f17] border border-[#2a2a35] rounded-lg p-12 text-center">
                <Search className="w-16 h-16 mx-auto mb-4 text-[#9AA0A6]" />
                <h3 className="text-xl font-semibold mb-2 text-[#E6E8EB]">
                  No activities found
                </h3>
                <p className="mb-4 text-[#9AA0A6]">
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
                    className="px-4 py-2 rounded-lg bg-[#27C3FF]/20 border border-[#27C3FF]/30 text-[#E6E8EB] hover:bg-[#27C3FF]/30 transition-colors"
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
                    onActivityClick={handleActivityClick}
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