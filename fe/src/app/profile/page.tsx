"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { Settings, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { GET_MY_TRIPS } from "@/graphql/queries";

// Types
interface UserData {
  name: string;
  email: string;
  bio: string;
}

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

  // State
  const [user, setUser] = useState<UserData>({
    name: "John Doe",
    email: "john@example.com",
    bio: "Travel enthusiast exploring the world one destination at a time.",
  });
  
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(user.bio);
  
  // Update tempBio when user.bio changes
  React.useEffect(() => {
    setTempBio(user.bio);
  }, [user.bio]);

  // GraphQL Query
  const { data, loading, error } = useQuery(GET_MY_TRIPS, {
    variables: { limit: 10, offset: 0 },
  });

  // Derived state
  const preplannedTrips: Trip[] = data?.myTrips?.trips || [];

  // Event handlers
  const handleLogout = () => {
    localStorage.removeItem("gn_token");
    document.cookie = "gn_token=; path=/; max-age=0";
    router.push("/login");
  };

  const handleEditProfile = () => {
    setIsEditingBio(true);
    setTempBio(user.bio);
  };

  const handleSaveBio = () => {
    setUser(prev => ({ ...prev, bio: tempBio }));
    setIsEditingBio(false);
  };

  const handleCancelBio = () => {
    setTempBio(user.bio);
    setIsEditingBio(false);
  };

  const navigateToTrip = (tripId: string) => {
    router.push(`/trip/${tripId}/view`);
  };

  const navigateToItinerary = (tripId: string) => {
    router.push(`/trip/${tripId}/itinerary`);
  };

  const retryLoadTrips = () => {
    // Force refetch the trips query
    window.location.reload();
  };

  // Components
  const Navbar = () => (
    <header className="px-6 py-4 border-b border-[#2a2a35] sticky top-0 z-30 bg-[#0b0b12]/90 backdrop-blur">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="text-2xl font-semibold text-white hover:opacity-90"
        >
          GlobeNomad
        </button>
        
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-md hover:bg-[#14141c]"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button
            className="p-2 rounded-md hover:bg-[#14141c]"
            aria-label="Account"
          >
            <User className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleLogout}
            className="p-2 rounded-md hover:bg-[#14141c] text-red-400 hover:text-red-300"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );

  const UserInfoSection = () => (
    <div className="border-b border-[#2a2a35] pb-6 mb-8">
      <div className="bg-[#14141c] rounded-lg p-6">
        <div className="text-2xl font-semibold mb-2">{user.name}</div>
        <div className="text-sm text-[#9AA0A6] mb-4">{user.email}</div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#E6E8EB] mb-2">Bio</label>
          {isEditingBio ? (
            <div className="space-y-3">
              <textarea
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                className="w-full p-3 bg-[#23232e] border border-[#2a2a35] rounded-lg text-[#E6E8EB] placeholder-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-[#c7a14a] focus:border-transparent resize-none"
                rows={3}
                placeholder="Tell us about yourself..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveBio}
                  className="px-4 py-2 rounded bg-[#c7a14a] text-white text-sm hover:bg-[#b8924a] transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelBio}
                  className="px-4 py-2 rounded bg-[#23232e] text-[#E6E8EB] text-sm hover:bg-[#2a2a35] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[#E6E8EB] text-sm leading-relaxed">{user.bio}</p>
              <button
                onClick={handleEditProfile}
                className="px-4 py-2 rounded bg-[#c7a14a] text-white text-sm hover:bg-[#b8924a] transition-colors"
              >
                Edit Bio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const TripCard = ({ trip }: { trip: Trip }) => (
    <div className="bg-[#14141c] rounded-lg p-4 flex flex-col">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-[#E6E8EB] mb-2">{trip.title}</h3>
        {trip.description && (
          <p className="text-sm text-[#9AA0A6] mb-2 line-clamp-2">{trip.description}</p>
        )}
        {(trip.startDate || trip.endDate) && (
          <div className="text-xs text-[#9AA0A6] mb-2">
            {trip.startDate && new Date(trip.startDate).toLocaleDateString()} 
            {trip.startDate && trip.endDate && ' - '}
            {trip.endDate && new Date(trip.endDate).toLocaleDateString()}
          </div>
        )}
        {trip.estimatedBudget && (
          <div className="text-xs text-[#c7a14a] mb-2">
            Budget: {trip.currency || '$'}{trip.estimatedBudget}
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-auto">
        <button
          className="flex-1 px-3 py-2 rounded bg-[#c7a14a] text-white text-sm hover:bg-[#b8924a] transition-colors"
          onClick={() => navigateToItinerary(trip.id)}
        >
          Itinerary
        </button>
        <button
          className="flex-1 px-3 py-2 rounded bg-[#23232e] text-[#E6E8EB] text-sm hover:bg-[#2a2a35] transition-colors"
          onClick={() => navigateToTrip(trip.id)}
        >
          Details
        </button>
      </div>
    </div>
  );

  const PreplannedTripsSection = () => (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">My Itineraries</h2>
      
      {loading ? (
        <div className="text-center text-[#9AA0A6] py-8">
          <div className="animate-pulse">Loading itineraries...</div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="bg-[#14141c] rounded-lg p-6 border border-red-500/20">
            <div className="text-red-400 mb-2">⚠️ Failed to load itineraries</div>
            <p className="text-[#9AA0A6] text-sm mb-4">
              {error.message.includes('Unauthorized') || error.message.includes('401') 
                ? 'Please log in to view your itineraries.' 
                : 'There was an error loading your itineraries. Please try again.'}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={retryLoadTrips}
                className="px-4 py-2 rounded bg-[#c7a14a] text-white text-sm hover:bg-[#b8924a] transition-colors"
              >
                Retry
              </button>
              {error.message.includes('Unauthorized') || error.message.includes('401') ? (
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 rounded bg-[#23232e] text-[#E6E8EB] text-sm hover:bg-[#2a2a35] transition-colors"
                >
                  Login
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {preplannedTrips.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <div className="bg-[#14141c] rounded-lg p-6">
                <div className="text-[#9AA0A6] mb-2">📝 No itineraries yet</div>
                <p className="text-[#9AA0A6] text-sm mb-4">
                  Start planning your next adventure!
                </p>
                <button
                  onClick={() => router.push('/trip/new')}
                  className="px-4 py-2 rounded bg-[#c7a14a] text-white text-sm hover:bg-[#b8924a] transition-colors"
                >
                  Create Itinerary
                </button>
              </div>
            </div>
          ) : (
            preplannedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB]">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <UserInfoSection />
        <PreplannedTripsSection />
        
        {/* TODO: Add Previous Trips section when data is available */}
      </div>
    </div>
  );
}
