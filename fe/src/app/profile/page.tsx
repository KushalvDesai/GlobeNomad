"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { User, LogOut, Edit2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { GET_USER_PROFILE, GET_MY_TRIPS } from "@/graphql/queries";

// Types
interface Trip {
  id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  estimatedBudget?: number;
  currency?: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState("");

  // Fetch user profile data
  const { data: profileData, loading: profileLoading, error: profileError } = useQuery(GET_USER_PROFILE, {
    fetchPolicy: "cache-and-network",
  });

  // Fetch user trips
  const { data: tripsData, loading: tripsLoading, error: tripsError } = useQuery(GET_MY_TRIPS, {
    variables: { limit: 10, offset: 0 },
  });

  const user = profileData?.me;
  const trips: Trip[] = tripsData?.myTrips?.trips || [];

  // Initialize tempBio when user data loads
  React.useEffect(() => {
    if (user && !tempBio) {
      setTempBio(user.bio || "Travel enthusiast exploring the world one destination at a time.");
    }
  }, [user, tempBio]);

  // Event handlers
  const handleLogout = () => {
    localStorage.removeItem("gn_token");
    document.cookie = "gn_token=; path=/; max-age=0";
    router.push("/login");
  };

  const handleEditBio = () => {
    setIsEditingBio(true);
  };

  const handleSaveBio = () => {
    // TODO: Implement bio update mutation
    setIsEditingBio(false);
  };

  const handleCancelBio = () => {
    setTempBio(user?.bio || "Travel enthusiast exploring the world one destination at a time.");
    setIsEditingBio(false);
  };

  const navigateToTrip = (tripId: string) => {
    router.push(`/trip/${tripId}/view`);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (profileError || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load profile</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => router.push("/")}
              className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              GlobeNomad
            </button>
            
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push("/activities")}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Activities
              </button>
              
              <button
                className="p-2 rounded-full bg-blue-100 text-blue-600"
                aria-label="Profile (Current Page)"
              >
                <User className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500 mt-1">Role: {user.role || 'User'}</p>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">About</h3>
              {!isEditingBio && (
                <button
                  onClick={handleEditBio}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
              )}
            </div>
            
            {isEditingBio ? (
              <div className="space-y-3">
                <textarea
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveBio}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancelBio}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed">
                {user.bio || tempBio}
              </p>
            )}
          </div>
        </div>

        {/* Trips Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Adventures</h2>
            <button
              onClick={() => router.push("/trip/new")}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Plan New Trip
            </button>
          </div>

          {tripsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading trips...</p>
            </div>
          ) : tripsError ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">Failed to load trips</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Adventures Yet</h3>
              <p className="text-gray-600 mb-6">Start planning your first adventure!</p>
              <button
                onClick={() => router.push("/trip/new")}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Plan Your First Trip
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigateToTrip(trip.id)}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{trip.title}</h3>
                  {trip.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{trip.description}</p>
                  )}
                  {(trip.startDate || trip.endDate) && (
                    <div className="text-xs text-gray-500 mb-2">
                      {trip.startDate && new Date(trip.startDate).toLocaleDateString()}
                      {trip.startDate && trip.endDate && ' - '}
                      {trip.endDate && new Date(trip.endDate).toLocaleDateString()}
                    </div>
                  )}
                  {trip.estimatedBudget && (
                    <div className="text-xs text-blue-600">
                      Budget: {trip.currency || '$'}{trip.estimatedBudget}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
