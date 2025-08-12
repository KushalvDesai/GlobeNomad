'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { Users, Globe, Search, RefreshCw, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GET_PUBLIC_TRIPS } from '@/graphql/queries';
import { PublicTripsResponse, GetPublicTripsVariables } from '@/graphql/types';
import { PublicTripCard } from '@/components/trips/PublicTripCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Header from '@/components/ui/Header';

const TRIPS_PER_PAGE = 9;

export default function CommunityPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("gn_token") || 
                   document.cookie.split(';').find(c => c.trim().startsWith('gn_token='));
      
      if (!token) {
        setIsAuthenticated(false);
        router.push("/login");
        return;
      }
      setIsAuthenticated(true);
    };

    checkAuth();
  }, [router]);
  
  const { data, loading, error, refetch, fetchMore } = useQuery<
    { findAllPublicTrips: PublicTripsResponse },
    GetPublicTripsVariables
  >(GET_PUBLIC_TRIPS, {
    variables: {
      limit: TRIPS_PER_PAGE,
      offset: currentPage * TRIPS_PER_PAGE,
    },
    errorPolicy: 'all',
  });

  const handleLoadMore = async () => {
    if (data?.findAllPublicTrips.hasMore) {
      try {
        await fetchMore({
          variables: {
            limit: TRIPS_PER_PAGE,
            offset: (currentPage + 1) * TRIPS_PER_PAGE,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            
            return {
              findAllPublicTrips: {
                ...fetchMoreResult.findAllPublicTrips,
                trips: [
                  ...prev.findAllPublicTrips.trips,
                  ...fetchMoreResult.findAllPublicTrips.trips,
                ],
              },
            };
          },
        });
        setCurrentPage(prev => prev + 1);
      } catch (err) {
        console.error('Error loading more trips:', err);
      }
    }
  };

  const handleRefresh = () => {
    setCurrentPage(0);
    refetch({
      limit: TRIPS_PER_PAGE,
      offset: 0,
    });
  };

  // Show loading or redirect if not authenticated
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0b0b12] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const filteredTrips = data?.findAllPublicTrips.trips.filter(trip =>
    searchTerm === '' || 
    trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB]">
      <Header />

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <section className="text-center py-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#c7a14a] to-[#8b6e3c]">
                <Globe className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Travel Community
            </h1>
            <p className="text-[#9AA0A6] text-lg md:text-xl max-w-2xl mx-auto">
              Discover amazing trips shared by fellow travelers around the world
            </p>
            <div className="flex items-center justify-center gap-2 mt-6">
              <Users className="w-5 h-5 text-[#c7a14a]" />
              <span className="text-[#E6E8EB]">
                {data?.findAllPublicTrips.total || 0} public trips to explore
              </span>
            </div>
          </section>

          {/* Search and Filters */}
          <section>
            <div className="flex flex-col md:flex-row items-stretch gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA0A6] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search trips by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-md bg-[#0f0f17] border border-[#2a2a35] text-[#E6E8EB] placeholder-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-[#c7a14a]"
                />
              </div>
              <div className="flex gap-3 shrink-0">
                <button className="px-4 py-3 rounded-md bg-[#15151f] border border-[#2a2a35] text-[#E6E8EB] hover:bg-[#1a1a26] flex items-center gap-2 transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                <button className="px-4 py-3 rounded-md bg-[#15151f] border border-[#2a2a35] text-[#E6E8EB] hover:bg-[#1a1a26] flex items-center gap-2 transition-colors">
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Sort by</span>
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-4 py-3 rounded-md bg-[#15151f] border border-[#2a2a35] text-[#E6E8EB] hover:bg-[#1a1a26] flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section>
            {loading && currentPage === 0 ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="py-8">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-red-200">Failed to load public trips. Please try again.</p>
                    </div>
                    <div className="ml-3">
                      <button
                        onClick={handleRefresh}
                        className="bg-red-800/50 text-red-200 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-700/50 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-16 h-16 text-[#2a2a35] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {searchTerm ? 'No trips found' : 'No public trips yet'}
                </h3>
                <p className="text-[#9AA0A6]">
                  {searchTerm 
                    ? 'Try adjusting your search terms or browse all trips.' 
                    : 'Be the first to share your travel experience with the community!'
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 text-[#c7a14a] hover:text-[#8b6e3c] font-medium transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-sm text-[#9AA0A6]">
                    {searchTerm ? (
                      <>Showing {filteredTrips.length} of {data?.findAllPublicTrips.total} trips</>
                    ) : (
                      <>Showing {filteredTrips.length} trips</>
                    )}
                  </p>
                </div>

                {/* Trips Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {filteredTrips.map((trip, index) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <PublicTripCard
                        trip={trip}
                        onClick={() => {
                          // Navigate to trip itinerary view
                          router.push(`/trip/${trip.id}/itinerary/view`);
                        }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Load More Button */}
                {data?.findAllPublicTrips.hasMore && !searchTerm && (
                  <div className="text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white shadow-lg hover:brightness-110 bg-gradient-to-r from-[#c7a14a] to-[#8b6e3c] disabled:opacity-50 transition-all"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="text-white" />
                          Loading more...
                        </>
                      ) : (
                        <>
                          Load More Trips
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}