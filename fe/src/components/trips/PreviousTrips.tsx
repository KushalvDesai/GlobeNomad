"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Plus, ArrowRight, RefreshCw, Star, TrendingUp } from "lucide-react";
import { GET_MY_TRIPS } from "@/graphql/queries";
import { Trip, TripsResponse } from "@/graphql/types";
import { TripCard } from "./TripCard";

// Top suggestions data - curated popular destinations
const topSuggestions = [
  {
    id: "suggestion-1",
    title: "Bali Paradise Getaway",
    description: "Experience the magic of Bali with stunning beaches, temples, and culture",
    startDate: "2024-06-01",
    endDate: "2024-06-08",
    isPublic: true,
    estimatedBudget: 95000,
    currency: "INR",
    owner: { id: "1", email: "user@example.com" },
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "suggestion-2",
    title: "Swiss Alps Adventure",
    description: "Breathtaking mountain views and alpine adventures in Switzerland",
    startDate: "2024-07-15",
    endDate: "2024-07-25",
    isPublic: true,
    estimatedBudget: 180000,
    currency: "INR",
    owner: { id: "1", email: "user@example.com" },
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "suggestion-3",
    title: "Tokyo Cultural Journey",
    description: "Immerse yourself in Japanese culture, food, and modern city life",
    startDate: "2024-08-10",
    endDate: "2024-08-18",
    isPublic: true,
    estimatedBudget: 140000,
    currency: "INR",
    owner: { id: "1", email: "user@example.com" },
    createdAt: "2024-02-20T00:00:00Z",
    updatedAt: "2024-02-20T00:00:00Z",
  },
] as Trip[];

// Static data for top regions (fallback when no database data)
const staticTopRegions = [
  {
    id: "static-1",
    title: "Golden Triangle Adventure",
    description: "Explore Delhi, Agra, and Jaipur in this classic Indian circuit",
    startDate: "2024-03-15",
    endDate: "2024-03-22",
    isPublic: true,
    estimatedBudget: 85000,
    currency: "INR",
    owner: { id: "1", email: "user@example.com" },
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "static-2",
    title: "Kerala Backwaters Experience",
    description: "Serene houseboat journey through Kerala's beautiful backwaters",
    startDate: "2024-04-10",
    endDate: "2024-04-17",
    isPublic: true,
    estimatedBudget: 65000,
    currency: "INR",
    owner: { id: "1", email: "user@example.com" },
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "static-3",
    title: "Rajasthan Royal Heritage",
    description: "Discover the royal palaces and forts of Rajasthan",
    startDate: "2024-05-05",
    endDate: "2024-05-14",
    isPublic: true,
    estimatedBudget: 120000,
    currency: "INR",
    owner: { id: "1", email: "user@example.com" },
    createdAt: "2024-02-20T00:00:00Z",
    updatedAt: "2024-02-20T00:00:00Z",
  },
] as Trip[];

export function PreviousTrips() {
  const router = useRouter();
  
  const { data, loading, error, refetch, networkStatus } = useQuery<{ myTrips: TripsResponse }>(GET_MY_TRIPS, {
    variables: { limit: 6.0, offset: 0.0 },
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      console.log("✅ GET_MY_TRIPS completed successfully:", {
        tripsCount: data?.myTrips?.trips?.length || 0,
        total: data?.myTrips?.total || 0,
        hasMore: data?.myTrips?.hasMore || false
      });
    },
    onError: (error) => {
      console.error("❌ GET_MY_TRIPS error:", {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
        extraInfo: error.extraInfo
      });
    },
  });

  // Debug logging
  useEffect(() => {
    console.log("🔍 PreviousTrips Debug State:", {
      loading,
      networkStatus,
      error: error?.message,
      errorType: error?.networkError ? 'Network' : error?.graphQLErrors?.length ? 'GraphQL' : 'None',
      dataExists: !!data,
      tripsCount: data?.myTrips?.trips?.length || 0,
      total: data?.myTrips?.total || 0,
    });
  }, [loading, error, data, networkStatus]);

  // Determine what data to show
  const hasDbTrips = data?.myTrips?.trips && data.myTrips.trips.length > 0;
  const trips = hasDbTrips ? data.myTrips.trips : staticTopRegions;
  const showingDbTrips = hasDbTrips;
  
  const handleTripClick = (trip: Trip) => {
    if (trip.id.startsWith("static-") || trip.id.startsWith("suggestion-")) {
      // For static/suggestion trips, navigate to create new trip with destination
      const destination = trip.title.includes("Kerala") ? "Kerala" 
                        : trip.title.includes("Rajasthan") ? "Jaipur"
                        : trip.title.includes("Golden Triangle") ? "Delhi"
                        : trip.title.includes("Bali") ? "Bali"
                        : trip.title.includes("Swiss") ? "Switzerland"
                        : trip.title.includes("Tokyo") ? "Tokyo"
                        : "";
      router.push(`/trip/new${destination ? `?destination=${encodeURIComponent(destination)}` : ""}`);
    } else {
      // For real trips, navigate to trip itinerary view
      router.push(`/trip/${trip.id}/itinerary/view`);
    }
  };

  const handleViewAllTrips = () => {
    router.push("/trips");
  };

  const handlePlanNewTrip = () => {
    router.push("/trip/new");
  };

  const handleRefresh = () => {
    refetch();
  };

  if (loading && !data) {
    return (
      <div className="space-y-8">
        {/* Top Suggestions Loading */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-[var(--accent-1)]" />
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">Loading Suggestions...</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-[var(--muted)] rounded w-3/4"></div>
                  <div className="h-3 bg-[var(--muted)] rounded w-full"></div>
                  <div className="h-3 bg-[var(--muted)] rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Previous Trips Loading */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-[var(--accent-1)]" />
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">Loading Your Trips...</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-[var(--muted)] rounded w-3/4"></div>
                  <div className="h-3 bg-[var(--muted)] rounded w-full"></div>
                  <div className="h-3 bg-[var(--muted)] rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Suggestions Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-[var(--accent-1)]" />
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">Top Suggestions</h2>
            <span className="px-2 py-1 text-xs rounded-full bg-[var(--accent-1)]/20 text-[var(--accent-1)] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Popular
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topSuggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative"
            >
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-[var(--accent-1)] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Top Pick
                </div>
              </div>
              <TripCard trip={suggestion} onClick={() => handleTripClick(suggestion)} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Previous Trips Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-[var(--accent-1)]" />
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">
              {showingDbTrips ? "Your Previous Trips" : "Popular Destinations"}
            </h2>
            {showingDbTrips && (
              <span className="px-2 py-1 text-xs rounded-full bg-green-500 text-white">
                {data?.myTrips?.total || 0} previous trips found
              </span>
            )}
            {error && (
              <span className="px-2 py-1 text-xs rounded-full bg-red-500 text-white">
                Error: {error.message.substring(0, 30)}...
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              {showingDbTrips && (
                <button
                  onClick={handleViewAllTrips}
                  className="text-[var(--accent-1)] hover:text-[var(--accent-1)]/80 flex items-center gap-1 text-sm font-medium transition-colors"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="text-red-400 text-sm">
              <strong>Error loading trips:</strong> {error.message}
            </div>
            {error.networkError && (
              <div className="text-red-300 text-xs mt-1">
                Network Error: Check if backend is running on http://localhost:3000/graphql
              </div>
            )}
            {error.graphQLErrors && error.graphQLErrors.length > 0 && (
              <div className="text-red-300 text-xs mt-1">
                GraphQL Errors: {error.graphQLErrors.map(e => e.message).join(', ')}
              </div>
            )}
            <button
              onClick={handleRefresh}
              className="mt-2 text-red-400 hover:text-red-300 underline text-sm"
            >
              Try again
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.slice(0, 6).map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <TripCard trip={trip} onClick={() => handleTripClick(trip)} />
            </motion.div>
          ))}
        </div>

        {trips.length === 0 && !loading && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No trips yet</h3>
            <p className="text-[var(--muted-foreground)] mb-6">
              Start planning your first adventure and create unforgettable memories.
            </p>
            <button
              onClick={handlePlanNewTrip}
              className="px-6 py-3 rounded-md bg-[var(--accent-1)] text-[var(--foreground)] hover:bg-[var(--accent-1)]/90 flex items-center gap-2 mx-auto font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Plan Your First Trip
            </button>
          </div>
        )}
      </section>
    </div>
  );
}