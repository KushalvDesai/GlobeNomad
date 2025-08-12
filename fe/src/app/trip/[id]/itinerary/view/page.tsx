"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, use, useEffect } from "react";
import { Settings, User, LogOut, Calendar, MapPin, Edit, ArrowLeft, Filter, Search, Users, Plus, X } from "lucide-react";
import { useQuery } from "@apollo/client";
import { GET_TRIP, GET_ITINERARY } from "@/graphql/queries";
import type { Itinerary, ItineraryItem } from "@/graphql/types";

export default function ViewItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [groupBy, setGroupBy] = useState("day");
  const [sortBy, setSortBy] = useState("time");
  const [showDaySelector, setShowDaySelector] = useState(false);
  
  const { data: tripData, loading: tripLoading } = useQuery(GET_TRIP, { variables: { id } });
  const { data: itineraryData, loading: itineraryLoading } = useQuery<{ getItinerary: Itinerary }>(GET_ITINERARY, { 
    variables: { tripId: id },
    errorPolicy: 'ignore'
  });
  
  const trip = tripData?.trip as { 
    id: string; 
    title: string; 
    startDate?: string; 
    endDate?: string;
    estimatedBudget?: number;
    currency?: string;
  } | undefined;
  
  const itinerary = itineraryData?.getItinerary;

  // Calculate trip days
  const tripDays = useMemo(() => {
    if (!trip?.startDate || !trip?.endDate) return [];
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = [];
    const current = new Date(start);
    
    while (current <= end) {
      days.push(new Date(current).toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [trip?.startDate, trip?.endDate]);

  // Group itinerary items by day
  const itemsByDay = useMemo(() => {
    if (!itinerary?.items) return {};
    
    const grouped: { [day: string]: ItineraryItem[] } = {};
    let unassignedItems: ItineraryItem[] = [];
    
    // First pass: assign items with valid dates
    itinerary.items.forEach(item => {
      if (item.startTime) {
        const date = new Date(item.startTime);
        // Check if the date is valid
        if (!isNaN(date.getTime())) {
          const dayKey = date.toISOString().slice(0, 10);
          if (!grouped[dayKey]) grouped[dayKey] = [];
          grouped[dayKey].push(item);
        } else {
          unassignedItems.push(item);
        }
      } else {
        unassignedItems.push(item);
      }
    });
    
    // Second pass: distribute unassigned items across trip days
    if (unassignedItems.length > 0 && tripDays.length > 0) {
      unassignedItems.forEach((item, index) => {
        // Distribute items across available days in round-robin fashion
        const dayIndex = index % tripDays.length;
        const dayKey = tripDays[dayIndex];
        if (!grouped[dayKey]) grouped[dayKey] = [];
        grouped[dayKey].push(item);
      });
    }
    
    // Sort items within each day by start time
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => {
        if (!a.startTime || !b.startTime) return 0;
        const dateA = new Date(a.startTime);
        const dateB = new Date(b.startTime);
        // Handle invalid dates - put them at the end
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateA.getTime() - dateB.getTime();
      });
    });
    
    return grouped;
  }, [itinerary?.items, tripDays]);

  // Filter items based on search
  const filteredItemsByDay = useMemo(() => {
    if (!searchQuery.trim()) return itemsByDay;
    
    const filtered: { [day: string]: ItineraryItem[] } = {};
    
    Object.entries(itemsByDay).forEach(([day, items]) => {
      const filteredItems = items.filter(item => 
        item.stop.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.stop.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.stop.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (filteredItems.length > 0) {
        filtered[day] = filteredItems;
      }
    });
    
    return filtered;
  }, [itemsByDay, searchQuery]);

  // Calculate total budget
  const totalBudget = useMemo(() => {
    if (!itinerary?.items) return 0;
    return itinerary.items.reduce((total, item) => {
      return total + (item.stop.estimatedCost || 0);
    }, 0);
  }, [itinerary?.items]);

  const handleLogout = () => {
    localStorage.removeItem("gn_token");
    document.cookie = "gn_token=; path=/; max-age=0";
    router.push("/login");
  };

  const handleEditItinerary = () => {
    router.push(`/trip/${id}/itinerary`);
  };

  const handleAddActivity = () => {
    if (tripDays.length > 1) {
      // Show day selection modal if there are multiple days
      setShowDaySelector(true);
    } else {
      // If only one day, go directly to activities
      navigateToActivities(1);
    }
  };

  const navigateToActivities = (selectedDay: number) => {
    // Get the most common city from itinerary items
    const cities = itinerary?.items
      ?.map(item => item.stop.city)
      .filter(Boolean) || [];
    
    const cityCount = cities.reduce((acc, city) => {
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonCity = Object.entries(cityCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    const baseUrl = `/activities?tripId=${id}&day=${selectedDay}`;
    const url = mostCommonCity 
      ? `${baseUrl}&city=${encodeURIComponent(mostCommonCity)}`
      : baseUrl;
    
    router.push(url);
    setShowDaySelector(false);
  };

  const handleBackToTrips = () => {
    router.push("/trips");
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  const getDayNumber = (dateString: string) => {
    const dayIndex = tripDays.indexOf(dateString);
    return dayIndex >= 0 ? dayIndex + 1 : 1;
  };

  if (tripLoading || itineraryLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB] flex items-center justify-center">
        <div>Loading itinerary...</div>
      </div>
    );
  }

  if (!itinerary || !itinerary.items || itinerary.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB]">
        {/* Day Selection Modal */}
        {showDaySelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#0f0f17] rounded-lg border border-[#2a2a35] p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Select Day for Activity</h3>
                <button
                  onClick={() => setShowDaySelector(false)}
                  className="p-1 rounded-md hover:bg-[#14141c] text-[#9AA0A6] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[#9AA0A6] mb-4">Choose which day you want to add the activity to:</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {tripDays.map((day, index) => (
                  <button
                    key={day}
                    onClick={() => navigateToActivities(index + 1)}
                    className="w-full text-left p-3 rounded-md bg-[#14141c] hover:bg-[#1a1a24] border border-[#2a2a35] hover:border-[#c7a14a] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">Day {index + 1}</div>
                        <div className="text-sm text-[#9AA0A6]">{formatDate(day)}</div>
                      </div>
                      <div className="text-sm text-[#9AA0A6]">
                        {Object.entries(filteredItemsByDay).find(([d]) => d === day)?.[1]?.length || 0} activities
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <header className="px-6 py-4 border-b border-[#2a2a35] sticky top-0 z-30 bg-[#0b0b12]/90 backdrop-blur">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button onClick={() => router.push("/")} className="text-2xl font-semibold text-white hover:opacity-90">
              GlobeNomad
            </button>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-md hover:bg-[#14141c]" aria-label="Settings">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-md hover:bg-[#14141c]" aria-label="Account">
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

        <main className="px-6 py-8">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">No Itinerary Found</h1>
            <p className="text-[#9AA0A6] mb-6">
              This trip doesn't have an itinerary yet. Create one to start planning your activities.
            </p>
            <button
              onClick={handleEditItinerary}
              className="px-6 py-3 rounded-md bg-[#27C3FF] text-white hover:bg-[#27C3FF]/90 transition-colors"
            >
              Create Itinerary
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB]">
      {/* Day Selection Modal */}
      {showDaySelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#0f0f17] rounded-lg border border-[#2a2a35] p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Select Day for Activity</h3>
              <button
                onClick={() => setShowDaySelector(false)}
                className="p-1 rounded-md hover:bg-[#14141c] text-[#9AA0A6] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[#9AA0A6] mb-4">Choose which day you want to add the activity to:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {tripDays.map((day, index) => (
                <button
                  key={day}
                  onClick={() => navigateToActivities(index + 1)}
                  className="w-full text-left p-3 rounded-md bg-[#14141c] hover:bg-[#1a1a24] border border-[#2a2a35] hover:border-[#c7a14a] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Day {index + 1}</div>
                      <div className="text-sm text-[#9AA0A6]">{formatDate(day)}</div>
                    </div>
                    <div className="text-sm text-[#9AA0A6]">
                      {Object.entries(filteredItemsByDay).find(([d]) => d === day)?.[1]?.length || 0} activities
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="px-6 py-4 border-b border-[#2a2a35] sticky top-0 z-30 bg-[#0b0b12]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-2xl font-semibold text-white hover:opacity-90">
            GlobeNomad
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-md hover:bg-[#14141c]" aria-label="Settings">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-md hover:bg-[#14141c]" aria-label="Account">
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

      <main className="px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToTrips}
                className="flex items-center gap-2 text-[#9AA0A6] hover:text-[#E6E8EB] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Trips
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddActivity}
                className="px-4 py-2 rounded-md bg-[#c7a14a] text-white hover:bg-[#c7a14a]/90 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Activity
              </button>
              <button
                onClick={handleEditItinerary}
                className="px-4 py-2 rounded-md bg-[#c7a14a] text-white hover:bg-[#c7a14a]/90 transition-colors inline-flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Itinerary
              </button>
            </div>
          </div>

          {/* Trip Info */}
          <div className="bg-[#0f0f17] rounded-lg border border-[#2a2a35] p-6">
            <h1 className="text-3xl font-bold mb-2 text-white">{trip?.title ?? "Itinerary View"}</h1>
            {trip?.startDate && trip?.endDate && (
              <p className="text-[#9AA0A6] mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)} ({tripDays.length} days)
              </p>
            )}
            
            {/* Budget Section */}
            <div className="bg-[#14141c] rounded-lg p-4 mt-4">
              <h3 className="text-lg font-semibold mb-2 text-white">Budget Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#9AA0A6]">Estimated Trip Budget</p>
                  <p className="text-xl font-bold text-[#27C3FF]">
                    ₹{trip?.estimatedBudget?.toLocaleString() || "0"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#9AA0A6]">Activities Budget</p>
                  <p className="text-xl font-bold text-white">
                    ₹{totalBudget.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-[#0f0f17] rounded-lg border border-[#2a2a35] p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9AA0A6]" />
                <input
                  type="text"
                  placeholder="Search activities, places, or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-md bg-[#0b0b12] border border-[#2a2a35] text-[#E6E8EB] placeholder-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-[#27C3FF]"
                />
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                <div className="relative">
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                    className="appearance-none bg-[#0b0b12] border border-[#2a2a35] rounded-md px-4 py-3 pr-10 text-[#E6E8EB] focus:outline-none focus:ring-2 focus:ring-[#27C3FF] focus:border-transparent"
                  >
                    <option value="day">Group by day</option>
                    <option value="type">Group by type</option>
                    <option value="city">Group by city</option>
                  </select>
                  <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9AA0A6] pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-[#0b0b12] border border-[#2a2a35] rounded-md px-4 py-3 pr-10 text-[#E6E8EB] focus:outline-none focus:ring-2 focus:ring-[#27C3FF] focus:border-transparent"
                  >
                    <option value="time">Sort by time</option>
                    <option value="budget">Sort by budget</option>
                    <option value="name">Sort by name</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9AA0A6] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Itinerary Content */}
          <div className="space-y-6">
            {Object.entries(filteredItemsByDay)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([day, items]) => (
                <div key={day} className="bg-[#0f0f17] rounded-lg border border-[#2a2a35] overflow-hidden">
                  {/* Day Header */}
                  <div className="bg-[#14141c] px-6 py-4 border-b border-[#2a2a35]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-white">Day {getDayNumber(day)}</h2>
                        <p className="text-[#9AA0A6]">{formatDate(day)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#9AA0A6]">
                          {items.length} {items.length === 1 ? 'activity' : 'activities'}
                        </p>
                        <p className="font-semibold text-white">
                          Budget: ₹{items.reduce((sum, item) => sum + (item.stop.estimatedCost || 0), 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="p-6 space-y-4">
                    {items.map((item, index) => (
                      <div key={item.id} className="flex gap-4 p-4 bg-[#0b0b12] rounded-lg border border-[#2a2a35]">
                        {/* Time */}
                        <div className="flex-shrink-0 w-20 text-center">
                          <div className="text-sm font-medium text-white">{formatTime(item.startTime)}</div>
                          {item.endTime && (
                            <div className="text-xs text-[#9AA0A6]">
                              to {formatTime(item.endTime)}
                            </div>
                          )}
                        </div>

                        {/* Activity Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-white">{item.stop.name}</h3>
                              {item.stop.city && (
                                <p className="text-[#9AA0A6] flex items-center gap-1 mt-1">
                                  <MapPin className="w-4 h-4" />
                                  {item.stop.city}
                                </p>
                              )}
                              {item.stop.description && (
                                <p className="text-[#9AA0A6] mt-2">{item.stop.description}</p>
                              )}
                              {item.notes && (
                                <p className="text-sm text-[#9AA0A6] mt-2 italic">
                                  Note: {item.notes}
                                </p>
                              )}
                            </div>

                            {/* Budget */}
                            <div className="text-right ml-4">
                              <div className="bg-[#14141c] px-3 py-1 rounded-full">
                                <span className="text-sm font-medium text-white">
                                  ₹{item.stop.estimatedCost?.toLocaleString() || "0"}
                                </span>
                              </div>
                              {item.stop.type && (
                                <div className="text-xs text-[#9AA0A6] mt-1 capitalize">
                                  {item.stop.type}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {Object.keys(filteredItemsByDay).length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-[#9AA0A6] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                {searchQuery ? "No activities found" : "No activities planned"}
              </h3>
              <p className="text-[#9AA0A6] mb-6">
                {searchQuery 
                  ? "Try adjusting your search terms or clear the search to see all activities."
                  : "Start planning your trip by adding activities to your itinerary."
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={handleEditItinerary}
                  className="px-6 py-3 rounded-md bg-[#c7a14a] text-white hover:bg-[#c7a14a]/90 transition-colors"
                >
                  Add Activities
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}