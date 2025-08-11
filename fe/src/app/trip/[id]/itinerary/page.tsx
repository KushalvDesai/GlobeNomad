"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, use, useEffect } from "react";
import { Settings, User, LogOut, Trash2, GripVertical, Plus, Calendar, MapPin, Save } from "lucide-react";
import { useMutation, useQuery } from "@apollo/client";
import { GET_TRIP, GET_CITIES, GET_ITINERARY } from "@/graphql/queries";
import { CREATE_ITINERARY, UPDATE_ITINERARY, ADD_STOP_TO_TRIP, REMOVE_STOP_FROM_TRIP } from "@/graphql/mutations";
import type { CreateItineraryInput, UpdateItineraryInput, AddStopToTripInput, Itinerary, ItineraryItem } from "@/graphql/types";
import Fuse from "fuse.js";

type StopDraft = {
  id: string;
  city: string;
  name: string;
  notes: string;
  startDate: string;
  endDate: string;
  activity: string;
  budget: string;
  type: "attraction" | "destination" | "restaurant" | "hotel" | "activity";
};

export default function BuildItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);
  
  // Get first city and start date from query parameters
  const firstCityFromQuery = searchParams.get('firstCity');
  const startDateFromQuery = searchParams.get('startDate');
  
  // Debug query parameters
  useEffect(() => {
    console.log('Query parameters:', {
      firstCity: firstCityFromQuery,
      startDate: startDateFromQuery,
      allParams: Object.fromEntries(searchParams.entries())
    });
  }, [firstCityFromQuery, startDateFromQuery, searchParams]);
  
  const { data: tripData, loading: tripLoading } = useQuery(GET_TRIP, { variables: { id } });
  const { data: citiesData } = useQuery<{ getCities: string[] }>(GET_CITIES);
  const { data: itineraryData, loading: itineraryLoading, refetch: refetchItinerary } = useQuery<{ getItinerary: Itinerary }>(GET_ITINERARY, { 
    variables: { tripId: id },
    errorPolicy: 'ignore' // Ignore if itinerary doesn't exist yet
  });
  
  // Mutations
  const [createItinerary] = useMutation(CREATE_ITINERARY);
  const [updateItinerary] = useMutation(UPDATE_ITINERARY);
  const [addStopToTrip] = useMutation(ADD_STOP_TO_TRIP);
  const [removeStopFromTrip] = useMutation(REMOVE_STOP_FROM_TRIP);
  
  const trip = tripData?.trip as { 
    id: string; 
    title: string; 
    startDate?: string; 
    endDate?: string;
  } | undefined;
  
  const cityOptions = citiesData?.getCities ?? [];
  const fuse = useMemo(() => new Fuse(cityOptions, { includeScore: true, threshold: 0.35 }), [cityOptions]);
  const [activeCityIndex, setActiveCityIndex] = useState<number>(-1);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [draggedStopId, setDraggedStopId] = useState<string | null>(null);

  // Initialize stops from backend itinerary or create empty
  const [stops, setStops] = useState<StopDraft[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);

  // Initialize stops when data loads
  useEffect(() => {
    console.log('Effect triggered:', {
      isInitialized,
      trip: !!trip,
      firstCityFromQuery,
      startDateFromQuery,
      itineraryData: !!itineraryData?.getItinerary
    });

    if (!isInitialized && trip) {
      // Check if we have backend itinerary data
      if (itineraryData?.getItinerary) {
        const backendItinerary = itineraryData.getItinerary;
        setCurrentItinerary(backendItinerary);
        
        // Convert backend items to StopDraft format
        const convertedStops: StopDraft[] = backendItinerary.items.map((item: ItineraryItem) => ({
          id: item.id,
          city: item.stop.city || "",
          name: item.stop.name || "",
          notes: item.stop.notes || item.notes || "",
          startDate: item.startTime ? new Date(item.startTime).toISOString().slice(0, 10) : "",
          endDate: item.endTime ? new Date(item.endTime).toISOString().slice(0, 10) : "",
          activity: item.stop.description || "",
          budget: item.stop.estimatedCost?.toString() || "",
          type: (item.stop.type as StopDraft['type']) || "destination"
        }));
        
        console.log('Loading stops from backend:', convertedStops);
        setStops(convertedStops);
        setIsInitialized(true);
        return;
      }
      
      // Create initial stop if no backend data exists
      const tripStartDateString = startDateFromQuery || (trip.startDate ? new Date(trip.startDate).toISOString().slice(0, 10) : "");
      const firstCity = firstCityFromQuery || "";
      
      const initialStop: StopDraft = {
        id: crypto.randomUUID(),
        city: firstCity,
        name: "",
        notes: "",
        startDate: tripStartDateString,
        endDate: "",
        activity: "",
        budget: "",
        type: "destination"
      };
      
      console.log('Creating initial stop:', initialStop);
      setStops([initialStop]);
      setIsInitialized(true);
    }
  }, [trip, isInitialized, firstCityFromQuery, startDateFromQuery, id, itineraryData]);

  // Get date range for validation
  const tripStartDate = trip?.startDate ? new Date(trip.startDate).toISOString().slice(0, 10) : undefined;
  const tripEndDate = trip?.endDate ? new Date(trip.endDate).toISOString().slice(0, 10) : undefined;
  
  // Calculate days between start and end date
  const tripDays = useMemo(() => {
    if (!tripStartDate || !tripEndDate) return [];
    const start = new Date(tripStartDate);
    const end = new Date(tripEndDate);
    const days = [];
    const current = new Date(start);
    
    while (current <= end) {
      days.push(new Date(current).toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [tripStartDate, tripEndDate]);

  // Group stops by day
  const stopsByDay = useMemo(() => {
    const grouped: { [day: string]: StopDraft[] } = {};
    stops.forEach(stop => {
      const day = stop.startDate || tripStartDate || 'unassigned';
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(stop);
    });
    
    // Sort stops within each day by order (no time sorting needed)
    Object.keys(grouped).forEach(day => {
      // Keep original order or sort by another criteria if needed
    });
    
    return grouped;
  }, [stops, tripStartDate]);

  // Calculate the summary data for display and saving
  const summaryData = useMemo(() => {
    return stops.map((s, idx) => {
      const dayIndex = tripDays.indexOf(s.startDate);
      
      return {
        day: dayIndex >= 0 ? dayIndex + 1 : 1,
        order: idx,
        stop: {
          name: s.name || s.activity || `Stop ${idx + 1}`,
          city: s.city || undefined,
          description: s.notes || undefined,
          estimatedDuration: 120, // Default duration
          estimatedCost: s.budget ? parseFloat(s.budget) : undefined,
          type: s.type,
          notes: s.notes || undefined,
        },
        startTime: s.startDate ? `${s.startDate}T09:00:00Z` : undefined, // Default start time
        endTime: s.endDate ? `${s.endDate}T11:00:00Z` : undefined, // Default end time
        notes: s.notes || undefined,
      };
    });
  }, [stops, tripDays]);

  const handleSaveItinerary = async () => {
    // Validate all stops before saving
    const errors = getValidationErrors();
    if (Object.keys(errors).length > 0) {
      alert("Please fix date validation errors before saving the itinerary.");
      return;
    }

    try {
      if (currentItinerary) {
        // Update existing itinerary
        const updateInput: UpdateItineraryInput = {
          id: currentItinerary.id,
          items: summaryData.map((item, index) => ({
            id: currentItinerary.items[index]?.id,
            day: item.day,
            order: item.order,
            stop: {
              id: currentItinerary.items[index]?.stop?.id,
              name: item.stop.name,
              description: item.stop.description,
              city: item.stop.city,
              estimatedCost: item.stop.estimatedCost,
              estimatedDuration: item.stop.estimatedDuration,
              type: item.stop.type,
              notes: item.stop.notes,
            },
            startTime: item.startTime,
            endTime: item.endTime,
            notes: item.notes,
          })),
          notes: "Updated via frontend"
        };

        const result = await updateItinerary({
          variables: { updateItineraryInput: updateInput }
        });

        if (result.data?.updateItinerary) {
          setCurrentItinerary(result.data.updateItinerary);
          alert("Itinerary updated successfully!");
        }
      } else {
        // Create new itinerary
        const createInput: CreateItineraryInput = {
          tripId: id,
          items: summaryData.map(item => ({
            day: item.day,
            order: item.order,
            stop: {
              name: item.stop.name,
              description: item.stop.description,
              city: item.stop.city,
              estimatedCost: item.stop.estimatedCost,
              estimatedDuration: item.stop.estimatedDuration,
              type: item.stop.type,
              notes: item.stop.notes,
            },
            startTime: item.startTime,
            endTime: item.endTime,
            notes: item.notes,
          })),
          notes: "Created via frontend"
        };

        const result = await createItinerary({
          variables: { createItineraryInput: createInput }
        });

        if (result.data?.createItinerary) {
          setCurrentItinerary(result.data.createItinerary);
          alert("Itinerary created successfully!");
          
          // Refetch to get the latest data
          refetchItinerary();
        }
      }
      
      console.log('Saved itinerary data:', summaryData);
      
    } catch (error) {
      console.error("Error saving itinerary:", error);
      alert("Error saving itinerary. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("gn_token");
    document.cookie = "gn_token=; path=/; max-age=0";
    router.push("/login");
  };

  const addStop = async () => {
    // Use start date from query params if available, otherwise use trip start date
    const defaultStartDate = startDateFromQuery || tripStartDate || "";
    
    const newStop: StopDraft = {
      id: crypto.randomUUID(),
      city: "",
      name: "",
      notes: "",
      startDate: defaultStartDate,
      endDate: "",
      activity: "",
      budget: "",
      type: "destination"
    };

    // Add to local state immediately for UI responsiveness
    setStops(prev => [...prev, newStop]);
    
    // If we have a backend itinerary, add the stop there too
    if (currentItinerary) {
      try {
        const addStopInput: AddStopToTripInput = {
          tripId: id,
          day: 1, // Default day
          order: stops.length, // Add at the end
          stop: {
            name: newStop.name || "New Stop",
            city: newStop.city,
            description: newStop.activity,
            estimatedCost: parseFloat(newStop.budget) || 0,
            type: newStop.type,
            notes: newStop.notes,
          }
        };

        const result = await addStopToTrip({
          variables: { addStopInput }
        });

        if (result.data?.addStopToTrip) {
          setCurrentItinerary(result.data.addStopToTrip);
          refetchItinerary();
        }
      } catch (error) {
        console.error("Error adding stop to backend:", error);
        // Keep the local change even if backend fails
      }
    }
  };

  const removeStop = async (stopId: string) => {
    // Find the stop being removed
    const stopToRemove = stops.find(s => s.id === stopId);
    
    // Remove from local state immediately
    setStops(prev => prev.filter(s => s.id !== stopId));
    
    // If we have a backend itinerary and the stop has a backend ID, remove it there too
    if (currentItinerary && stopToRemove) {
      try {
        // Find the corresponding backend item
        const backendItem = currentItinerary.items.find(item => 
          item.stop.name === (stopToRemove.name || stopToRemove.activity)
        );
        
        if (backendItem) {
          const result = await removeStopFromTrip({
            variables: { 
              tripId: id,
              itemId: backendItem.id
            }
          });

          if (result.data?.removeStopFromTrip) {
            setCurrentItinerary(result.data.removeStopFromTrip);
            refetchItinerary();
          }
        }
      } catch (error) {
        console.error("Error removing stop from backend:", error);
        // Keep the local change even if backend fails
      }
    }
  };

  const updateStop = (stopId: string, updates: Partial<StopDraft>) => {
    setStops(prev => prev.map(s => s.id === stopId ? { ...s, ...updates } : s));
  };

  // Validation function for date constraints
  const validateStopDates = (stop: StopDraft): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Skip validation if dates are empty (don't show errors for null/empty values)
    if (!stop.startDate && !stop.endDate) {
      return { isValid: true, errors };
    }
    
    // If both dates are provided, validate them
    if (stop.startDate && stop.endDate) {
      const stopStart = new Date(stop.startDate);
      const stopEnd = new Date(stop.endDate);
      const tripStart = tripStartDate ? new Date(tripStartDate) : null;
      const tripEnd = tripEndDate ? new Date(tripEndDate) : null;
      
      // Check if start date is before end date
      if (stopStart > stopEnd) {
        errors.push("Start date must be before or equal to end date");
      }
      
      // Check if stop dates are within trip dates
      if (tripStart && stopStart < tripStart) {
        errors.push("Start date must be on or after trip start date");
      }
      
      if (tripEnd && stopEnd > tripEnd) {
        errors.push("End date must be on or before trip end date");
      }
    }
    
    // If only start date is provided, validate it against trip dates
    if (stop.startDate && !stop.endDate) {
      const stopStart = new Date(stop.startDate);
      const tripStart = tripStartDate ? new Date(tripStartDate) : null;
      
      if (tripStart && stopStart < tripStart) {
        errors.push("Start date must be on or after trip start date");
      }
    }
    
    // If only end date is provided, validate it against trip dates
    if (!stop.startDate && stop.endDate) {
      const stopEnd = new Date(stop.endDate);
      const tripEnd = tripEndDate ? new Date(tripEndDate) : null;
      
      if (tripEnd && stopEnd > tripEnd) {
        errors.push("End date must be on or before trip end date");
      }
    }
    
    return { isValid: errors.length === 0, errors };
  };

  // Get validation errors for all stops
  const getValidationErrors = () => {
    const allErrors: { [stopId: string]: string[] } = {};
    stops.forEach(stop => {
      const validation = validateStopDates(stop);
      if (!validation.isValid) {
        allErrors[stop.id] = validation.errors;
      }
    });
    return allErrors;
  };

  const validationErrors = getValidationErrors();

  // Debug: Log stops state
  useEffect(() => {
    console.log('Current stops state:', stops);
  }, [stops]);

  const handleDragStart = (e: React.DragEvent, stopId: string) => {
    setDraggedStopId(stopId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStopId: string) => {
    e.preventDefault();
    if (!draggedStopId || draggedStopId === targetStopId) return;

    setStops(prev => {
      const draggedIndex = prev.findIndex(s => s.id === draggedStopId);
      const targetIndex = prev.findIndex(s => s.id === targetStopId);
      
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      
      const newStops = [...prev];
      const [draggedStop] = newStops.splice(draggedIndex, 1);
      newStops.splice(targetIndex, 0, draggedStop);
      
      return newStops;
    });
    
    setDraggedStopId(null);
  };

  if (tripLoading || itineraryLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB] flex items-center justify-center">
        <div>Loading trip and itinerary...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB]">
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
            <div>
              <h1 className="text-2xl font-bold">{trip?.title ?? "Build Itinerary"}</h1>
              {trip?.startDate && trip?.endDate && (
                <p className="text-sm text-[#9AA0A6] mt-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {new Date(trip.startDate).toDateString()} - {new Date(trip.endDate).toDateString()}
                </p>
              )}
              <p className="text-sm text-[#9AA0A6] mt-1">
                Plan your day-wise activities and manage your travel itinerary
              </p>
            </div>
            <button
              onClick={handleSaveItinerary}
              className="px-6 py-3 rounded-md bg-[#c7a14a] text-white disabled:opacity-50 hover:bg-[#b8924a] transition-colors inline-flex items-center gap-2"
              disabled={stops.length === 0 || Object.keys(validationErrors).length > 0}
            >
              <Save className="w-4 h-4" />
              {currentItinerary ? 'Update Itinerary' : 'Save Itinerary'}
            </button>
          </div>

          {/* Trip Date Range Info */}
          {tripDays.length > 0 && (
            <div className="bg-[#0f0f17] border border-[#2a2a35] rounded-lg p-4">
              <h3 className="text-sm font-medium text-[#9AA0A6] mb-2">Trip Duration: {tripDays.length} days</h3>
              <div className="flex flex-wrap gap-2">
                {tripDays.map((day, index) => (
                  <span key={day} className="px-2 py-1 bg-[#14141c] rounded text-xs">
                    Day {index + 1}: {new Date(day).toLocaleDateString()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Global validation errors */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h3 className="text-red-400 font-medium mb-2">Date Validation Errors</h3>
              <p className="text-sm text-red-300">
                Please fix the date constraint violations in your stops before saving.
              </p>
            </div>
          )}

          {/* Stops List */}
          <div className="space-y-4">
            {stops.map((stop, idx) => (
              <div
                key={stop.id}
                draggable
                onDragStart={(e) => handleDragStart(e, stop.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stop.id)}
                className={`rounded-2xl border border-[#2a2a35] bg-[#0f0f17] p-6 transition-all ${
                  draggedStopId === stop.id ? "opacity-50" : ""
                } cursor-move hover:border-[#3a3a45]`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-[#9AA0A6] cursor-grab" />
                    <h2 className="text-lg font-semibold">Stop {idx + 1}</h2>
                    {validationErrors[stop.id] && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                        Date Error
                      </span>
                    )}
                    {stop.city && (
                      <span className="px-2 py-1 bg-[#27C3FF]/20 text-[#27C3FF] rounded text-sm">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {stop.city}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeStop(stop.id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-md hover:bg-[#14141c]"
                    aria-label="Delete stop"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Location & Date */}
                  <div className="space-y-3">
                    <div className="relative">
                      <label className="block text-sm font-medium text-[#9AA0A6] mb-1">City/Location</label>
                      <input
                        type="text"
                        value={stop.city}
                        onFocus={() => {
                          setActiveStopId(stop.id);
                          setActiveCityIndex(-1);
                        }}
                        onBlur={() => setTimeout(() => setActiveStopId(id => id === stop.id ? null : id), 120)}
                        onChange={(e) => updateStop(stop.id, { city: e.target.value })}
                        onKeyDown={(e) => {
                          const suggestions = stop.city.trim() ? fuse.search(stop.city.trim()).map(r => r.item).slice(0, 8) : [];
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setActiveCityIndex(prev => (prev + 1) % Math.max(1, suggestions.length));
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setActiveCityIndex(prev => prev <= 0 ? suggestions.length - 1 : prev - 1);
                          } else if (e.key === "Enter" && activeCityIndex >= 0 && suggestions.length > 0) {
                            e.preventDefault();
                            updateStop(stop.id, { city: suggestions[activeCityIndex] });
                            setActiveStopId(null);
                          }
                        }}
                        placeholder="Enter city name..."
                        className="w-full rounded-md bg-[#0b0b12] border border-[#2a2a35] p-3 focus:border-[#27C3FF] transition-colors"
                      />
                      {activeStopId === stop.id && stop.city.trim().length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 rounded-md border border-[#2a2a35] bg-[#0f0f17] shadow-xl z-10 max-h-48 overflow-auto">
                          {fuse.search(stop.city.trim()).map(result => result.item).slice(0, 8).map((city, i) => (
                            <button
                              key={city}
                              onMouseDown={() => {
                                updateStop(stop.id, { city });
                                setActiveStopId(null);
                              }}
                              className={`w-full text-left px-3 py-2 hover:bg-[#14141c] ${i === activeCityIndex ? "bg-[#14141c]" : ""}`}
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#9AA0A6] mb-1">Start Date</label>
                        <input
                          type="date"
                          value={stop.startDate}
                          onChange={(e) => updateStop(stop.id, { startDate: e.target.value })}
                          min={tripStartDate}
                          max={tripEndDate}
                          className="w-full rounded-md bg-[#0b0b12] border border-[#2a2a35] p-3 focus:border-[#27C3FF] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#9AA0A6] mb-1">End Date</label>
                        <input
                          type="date"
                          value={stop.endDate}
                          onChange={(e) => updateStop(stop.id, { endDate: e.target.value })}
                          min={stop.startDate || tripStartDate}
                          max={tripEndDate}
                          className="w-full rounded-md bg-[#0b0b12] border border-[#2a2a35] p-3 focus:border-[#27C3FF] transition-colors"
                        />
                      </div>
                    </div>
                    
                    {/* Date validation errors */}
                    {validationErrors[stop.id] && (
                      <div className="text-red-400 text-sm mt-1">
                        {validationErrors[stop.id].map((error, index) => (
                          <div key={index}>• {error}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Activity Details */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#9AA0A6] mb-1">Activity/Place Name</label>
                      <input
                        type="text"
                        value={stop.name}
                        onChange={(e) => updateStop(stop.id, { name: e.target.value })}
                        placeholder="e.g., Gateway of India, Hotel check-in..."
                        className="w-full rounded-md bg-[#0b0b12] border border-[#2a2a35] p-3 focus:border-[#27C3FF] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#9AA0A6] mb-1">Activity Type</label>
                      <select
                        value={stop.type}
                        onChange={(e) => updateStop(stop.id, { type: e.target.value as StopDraft['type'] })}
                        className="w-full rounded-md bg-[#0b0b12] border border-[#2a2a35] p-3 focus:border-[#27C3FF] transition-colors"
                      >
                        <option value="destination">Destination</option>
                        <option value="attraction">Tourist Attraction</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="hotel">Hotel</option>
                        <option value="activity">Activity</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#9AA0A6] mb-1">
                        ₹ Budget
                      </label>
                      <input
                        type="number"
                        value={stop.budget}
                        onChange={(e) => updateStop(stop.id, { budget: e.target.value })}
                        placeholder="0"
                        className="w-full rounded-md bg-[#0b0b12] border border-[#2a2a35] p-3 focus:border-[#27C3FF] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-[#9AA0A6] mb-1">Notes</label>
                  <textarea
                    value={stop.notes}
                    onChange={(e) => updateStop(stop.id, { notes: e.target.value })}
                    placeholder="Add notes, tickets info, special instructions..."
                    rows={3}
                    className="w-full rounded-md bg-[#0b0b12] border border-[#2a2a35] p-3 focus:border-[#27C3FF] transition-colors resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add Stop Button */}
          <div className="flex justify-center pt-4">
            <button 
              onClick={addStop}
              className="px-6 py-3 rounded-md border border-[#2a2a35] bg-[#0f0f17] hover:bg-[#14141c] transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Stop
            </button>
          </div>

          {/* Summary */}
          {stops.length > 0 && (
            <div className="bg-[#0f0f17] border border-[#2a2a35] rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Itinerary Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-[#9AA0A6]">Total Stops:</span>
                  <span className="ml-2 font-medium">{stops.length}</span>
                </div>
                <div>
                  <span className="text-[#9AA0A6]">Total Budget:</span>
                  <span className="ml-2 font-medium">
                    ₹{stops.reduce((sum, stop) => sum + (parseFloat(stop.budget) || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[#9AA0A6]">Date Range:</span>
                  <span className="ml-2 font-medium">
                    {(() => {
                      const validStops = stops.filter(s => s.startDate && s.endDate);
                      if (validStops.length === 0) {
                        // Check if any stops have at least a start date
                        const stopsWithStartDate = stops.filter(s => s.startDate);
                        if (stopsWithStartDate.length > 0) {
                          const earliest = stopsWithStartDate.reduce((min, stop) => stop.startDate < min ? stop.startDate : min, stopsWithStartDate[0].startDate);
                          return `From ${new Date(earliest).toLocaleDateString()}`;
                        }
                        return "Not set";
                      }
                      const earliest = validStops.reduce((min, stop) => stop.startDate < min ? stop.startDate : min, validStops[0].startDate);
                      const latest = validStops.reduce((max, stop) => stop.endDate > max ? stop.endDate : max, validStops[0].endDate);
                      return `${new Date(earliest).toLocaleDateString()} - ${new Date(latest).toLocaleDateString()}`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


