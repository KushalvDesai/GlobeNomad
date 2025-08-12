"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Plus, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Users,
  Calendar,
  DollarSign,
  X
} from "lucide-react";
import { GET_MY_TRIPS } from "@/graphql/queries";
import { TripCard } from "@/components/trips/TripCard";
import { Trip, TripsResponse } from "@/types/trip";

type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'budget-high' | 'budget-low';
type GroupByOption = 'none' | 'year' | 'month' | 'status' | 'budget';

interface FilterOption {
  status: 'all' | 'public' | 'private';
  budgetRange: 'all' | 'low' | 'medium' | 'high';
  dateRange: 'all' | 'this-year' | 'last-year' | 'older';
}

export default function TripsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOption>({
    status: 'all',
    budgetRange: 'all',
    dateRange: 'all'
  });

  const tripsPerPage = 12;

  const { data, loading, error, refetch } = useQuery<{ myTrips: TripsResponse }>(GET_MY_TRIPS, {
    variables: { limit: 1000.0, offset: 0.0 }, // Get all trips for client-side filtering
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const allTrips = data?.myTrips?.trips || [];

  // Filter trips based on search and filters
  const filteredTrips = useMemo(() => {
    let filtered = allTrips;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trip => 
        trip.title.toLowerCase().includes(query) ||
        trip.description?.toLowerCase().includes(query) ||
        trip.owner?.email?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(trip => 
        filters.status === 'public' ? trip.isPublic : !trip.isPublic
      );
    }

    // Budget filter
    if (filters.budgetRange !== 'all') {
      filtered = filtered.filter(trip => {
        const budget = trip.estimatedBudget || 0;
        switch (filters.budgetRange) {
          case 'low': return budget < 50000;
          case 'medium': return budget >= 50000 && budget <= 200000;
          case 'high': return budget > 200000;
          default: return true;
        }
      });
    }

    // Date filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const currentYear = now.getFullYear();
      
      filtered = filtered.filter(trip => {
        const tripYear = new Date(trip.createdAt).getFullYear();
        switch (filters.dateRange) {
          case 'this-year': return tripYear === currentYear;
          case 'last-year': return tripYear === currentYear - 1;
          case 'older': return tripYear < currentYear - 1;
          default: return true;
        }
      });
    }

    return filtered;
  }, [allTrips, searchQuery, filters]);

  // Sort trips
  const sortedTrips = useMemo(() => {
    const sorted = [...filteredTrips];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'budget-high':
        return sorted.sort((a, b) => (b.estimatedBudget || 0) - (a.estimatedBudget || 0));
      case 'budget-low':
        return sorted.sort((a, b) => (a.estimatedBudget || 0) - (b.estimatedBudget || 0));
      default:
        return sorted;
    }
  }, [filteredTrips, sortBy]);

  // Group trips
  const groupedTrips = useMemo(() => {
    if (groupBy === 'none') return {};

    const groups: Record<string, Trip[]> = {};

    sortedTrips.forEach(trip => {
      let groupKey = '';
      
      switch (groupBy) {
        case 'year':
          groupKey = new Date(trip.createdAt).getFullYear().toString();
          break;
        case 'month':
          const date = new Date(trip.createdAt);
          groupKey = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
          break;
        case 'status':
          groupKey = trip.isPublic ? 'Public Trips' : 'Private Trips';
          break;
        case 'budget':
          const budget = trip.estimatedBudget || 0;
          if (budget < 50000) groupKey = 'Budget (< Rs 50k)';
          else if (budget <= 200000) groupKey = 'Mid-range (Rs 50k - Rs 2L)';
          else groupKey = 'Luxury (> Rs 2L)';
          break;
        default:
          groupKey = 'All Trips';
      }

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(trip);
    });

    return groups;
  }, [sortedTrips, groupBy]);

  // Pagination
  const totalTrips = sortedTrips.length;
  const totalPages = Math.ceil(totalTrips / tripsPerPage);
  const startIndex = (currentPage - 1) * tripsPerPage;
  const currentTrips = sortedTrips.slice(startIndex, startIndex + tripsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, sortBy, groupBy]);

  const handleTripClick = (trip: Trip) => {
    router.push(`/trip/${trip.id}/itinerary/view`);
  };

  const handlePlanNewTrip = () => {
    router.push("/trip/new");
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilters: Partial<FilterOption>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      budgetRange: 'all',
      dateRange: 'all'
    });
    setSearchQuery("");
  };

  const hasActiveFilters = searchQuery.trim() !== "" || 
    filters.status !== 'all' || 
    filters.budgetRange !== 'all' || 
    filters.dateRange !== 'all';

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-[var(--accent-1)]" />
              <h1 className="text-3xl font-bold text-[var(--foreground)]">Loading Your Trips...</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-[var(--muted)] rounded w-3/4"></div>
                  <div className="h-3 bg-[var(--muted)] rounded w-full"></div>
                  <div className="h-3 bg-[var(--muted)] rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </div>

        {/* Search and Controls Bar */}
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search destinations, activities, or trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-1)] focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              {/* Group By */}
              <div className="relative">
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
                  className="appearance-none bg-[var(--background)] border border-[var(--border)] rounded-md px-4 py-3 pr-10 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-1)] focus:border-transparent"
                >
                  <option value="none">No grouping</option>
                  <option value="year">Group by year</option>
                  <option value="month">Group by month</option>
                  <option value="status">Group by status</option>
                  <option value="budget">Group by budget</option>
                </select>
                <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
              </div>

              {/* Filter */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-md border transition-colors ${
                  showFilters || hasActiveFilters
                    ? "bg-[var(--accent-1)] text-[var(--foreground)] border-[var(--accent-1)]"
                    : "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--muted)]"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filter
                {hasActiveFilters && (
                  <span className="bg-[var(--background)] text-[var(--accent-1)] text-xs px-1.5 py-0.5 rounded-full">
                    {[searchQuery.trim() && 1, filters.status !== 'all' && 1, filters.budgetRange !== 'all' && 1, filters.dateRange !== 'all' && 1].filter(Boolean).length}
                  </span>
                )}
              </button>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-[var(--background)] border border-[var(--border)] rounded-md px-4 py-3 pr-10 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-1)] focus:border-transparent"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                  <option value="budget-high">Budget high to low</option>
                  <option value="budget-low">Budget low to high</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange({ status: e.target.value as FilterOption['status'] })}
                      className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                    >
                      <option value="all">All trips</option>
                      <option value="public">Public only</option>
                      <option value="private">Private only</option>
                    </select>
                  </div>

                  {/* Budget Filter */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Budget Range
                    </label>
                    <select
                      value={filters.budgetRange}
                      onChange={(e) => handleFilterChange({ budgetRange: e.target.value as FilterOption['budgetRange'] })}
                      className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                    >
                      <option value="all">All budgets</option>
                      <option value="low">Budget (&lt; Rs 50k)</option>
                      <option value="medium">Mid-range (Rs 50k - Rs 2L)</option>
                      <option value="high">Luxury (&gt; Rs 2L)</option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Created
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => handleFilterChange({ dateRange: e.target.value as FilterOption['dateRange'] })}
                      className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                    >
                      <option value="all">All time</option>
                      <option value="this-year">This year</option>
                      <option value="last-year">Last year</option>
                      <option value="older">Older</option>
                    </select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-[var(--accent-1)]" />
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)]">Your Trips</h1>
              <p className="text-[var(--muted-foreground)] mt-1">
                {totalTrips > 0 ? (
                  <>
                    {totalTrips} trip{totalTrips === 1 ? '' : 's'} found
                    {hasActiveFilters && ` (filtered from ${allTrips.length})`}
                  </>
                ) : hasActiveFilters ? (
                  `No trips match your filters (${allTrips.length} total)`
                ) : (
                  'No trips yet'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20 mb-8">
            <div className="text-red-400">
              <strong>Error loading trips:</strong> {error.message}
            </div>
            {error.networkError && (
              <div className="text-red-300 text-sm mt-1">
                Network Error: Check if backend is running on http://localhost:3000/graphql
              </div>
            )}
            <button
              onClick={() => refetch()}
              className="mt-3 text-red-400 hover:text-red-300 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Trips Display */}
        {totalTrips > 0 ? (
          <>
            {/* Grouped Trips */}
            {groupBy !== 'none' ? (
              <div className="space-y-8 mb-8">
                {Object.entries(groupedTrips).map(([groupName, groupTrips]) => (
                  <div key={groupName}>
                    <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                      {groupName}
                      <span className="text-sm text-[var(--muted-foreground)] font-normal">
                        ({groupTrips.length} trip{groupTrips.length === 1 ? '' : 's'})
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {groupTrips.slice((currentPage - 1) * tripsPerPage, currentPage * tripsPerPage).map((trip, index) => (
                        <motion.div
                          key={trip.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <TripCard trip={trip} onClick={() => handleTripClick(trip)} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Regular Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {currentTrips.map((trip, index) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <TripCard trip={trip} onClick={() => handleTripClick(trip)} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        currentPage === page
                          ? "bg-[var(--accent-1)] text-[var(--foreground)]"
                          : "border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : !loading && !error ? (
          /* Empty State */
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-3">
              {hasActiveFilters ? 'No trips match your filters' : 'No trips yet'}
            </h2>
            <p className="text-[var(--muted-foreground)] mb-8 max-w-md mx-auto">
              {hasActiveFilters ? (
                'Try adjusting your search or filters to find more trips.'
              ) : (
                'Start planning your first adventure and create unforgettable memories. The world is waiting for you!'
              )}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-6 py-3 rounded-md border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] flex items-center gap-2 mx-auto font-medium transition-colors"
              >
                Clear filters
              </button>
            ) : (
              <button
                onClick={handlePlanNewTrip}
                className="px-8 py-4 rounded-md bg-[var(--accent-1)] text-[var(--foreground)] hover:bg-[var(--accent-1)]/90 flex items-center gap-3 mx-auto font-medium transition-colors"
              >
                <Plus className="w-6 h-6" />
                Plan Your First Trip
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}