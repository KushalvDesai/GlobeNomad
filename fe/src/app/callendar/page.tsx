'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, Filter, ArrowUpDown, Calendar, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GET_MY_TRIPS } from '@/graphql/queries';
import { TripsResponse, GetMyTripsVariables, Trip } from '@/graphql/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Header from '@/components/ui/Header';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

interface CalendarTrip {
  trip: Trip;
  startDate: Date;
  endDate: Date;
  daysSpan: number;
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
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

  // Fetch user trips
  const { data, loading, error } = useQuery<
    { myTrips: TripsResponse },
    GetMyTripsVariables
  >(GET_MY_TRIPS, {
    variables: {
      limit: 100.0, // Get more trips for calendar view
      offset: 0.0,
    },
    errorPolicy: 'all',
  });

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // Process trips for calendar display
  const calendarTrips = useMemo(() => {
    if (!data?.myTrips.trips) return [];
    
    return data.myTrips.trips
      .filter(trip => trip.startDate && trip.endDate)
      .map(trip => {
        const startDate = new Date(trip.startDate!);
        const endDate = new Date(trip.endDate!);
        const daysSpan = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        return {
          trip,
          startDate,
          endDate,
          daysSpan
        } as CalendarTrip;
      })
      .filter(calendarTrip => {
        if (!searchTerm) return true;
        return calendarTrip.trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               calendarTrip.trip.description?.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [data?.myTrips.trips, searchTerm]);

  // Get trips for a specific date
  const getTripsForDate = (date: Date) => {
    return calendarTrips.filter(calendarTrip => {
      const dateTime = date.getTime();
      return dateTime >= calendarTrip.startDate.getTime() && 
             dateTime <= calendarTrip.endDate.getTime();
    });
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
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

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB]">
      <Header />

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Search and Filters */}
          <section>
            <div className="flex flex-col md:flex-row items-stretch gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA0A6] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search trips..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-md bg-[#0f0f17] border border-[#2a2a35] text-[#E6E8EB] placeholder-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-[#c7a14a]"
                />
              </div>
              <div className="flex gap-3 shrink-0">
                <button className="px-4 py-3 rounded-md bg-[#15151f] border border-[#2a2a35] text-[#E6E8EB] hover:bg-[#1a1a26] flex items-center gap-2 transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Group by</span>
                </button>
                <button className="px-4 py-3 rounded-md bg-[#15151f] border border-[#2a2a35] text-[#E6E8EB] hover:bg-[#1a1a26] flex items-center gap-2 transition-colors">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                <button className="px-4 py-3 rounded-md bg-[#15151f] border border-[#2a2a35] text-[#E6E8EB] hover:bg-[#1a1a26] flex items-center gap-2 transition-colors">
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Sort by...</span>
                </button>
              </div>
            </div>
          </section>

          {/* Calendar View Title */}
          <section className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Calendar View
            </h1>
            <p className="text-[#9AA0A6]">
              View your trips organized by dates
            </p>
          </section>

          {/* Calendar */}
          <section>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400">Failed to load trips</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Calendar Header */}
                <div className="bg-[#12121a] p-4 flex items-center justify-between">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-[#1a1a26] rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  
                  <h2 className="text-xl font-bold text-white">
                    {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-[#1a1a26] rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 bg-gray-100">
                  {DAYS.map(day => (
                    <div key={day} className="p-3 text-center font-semibold text-gray-700 text-sm">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((date, index) => {
                    const tripsForDate = getTripsForDate(date);
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    return (
                      <motion.div
                        key={index}
                        className={`
                          min-h-[120px] p-2 border-r border-b border-gray-200 
                          ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'}
                          ${isToday ? 'bg-blue-50' : ''}
                          hover:bg-gray-50 transition-colors
                        `}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.1 }}
                      >
                        <div className={`
                          text-sm font-medium mb-2
                          ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                          ${isToday ? 'text-blue-600 font-bold' : ''}
                        `}>
                          {date.getDate()}
                        </div>
                        
                        <div className="space-y-1">
                          {tripsForDate.slice(0, 3).map((calendarTrip, tripIndex) => {
                            const isStartDate = date.toDateString() === calendarTrip.startDate.toDateString();
                            const isEndDate = date.toDateString() === calendarTrip.endDate.toDateString();
                            
                            return (
                              <motion.div
                                key={tripIndex}
                                className={`
                                  text-xs p-1 rounded text-white cursor-pointer
                                  ${tripIndex % 3 === 0 ? 'bg-blue-500' : 
                                    tripIndex % 3 === 1 ? 'bg-green-500' : 'bg-purple-500'}
                                  hover:opacity-80 transition-opacity
                                `}
                                onClick={() => router.push(`/trip/${calendarTrip.trip.id}/itinerary/view`)}
                                whileHover={{ scale: 1.05 }}
                                title={calendarTrip.trip.title}
                              >
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">
                                    {isStartDate && isEndDate ? calendarTrip.trip.title :
                                     isStartDate ? `${calendarTrip.trip.title} (Start)` :
                                     isEndDate ? `${calendarTrip.trip.title} (End)` :
                                     calendarTrip.trip.title}
                                  </span>
                                </div>
                              </motion.div>
                            );
                          })}
                          
                          {tripsForDate.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{tripsForDate.length - 3} more
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Trip Statistics */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#12121a] border border-[#2a2a35] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-[#c7a14a]" />
                <h3 className="font-semibold text-white">Total Trips</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {data?.myTrips.trips.length || 0}
              </p>
            </div>
            
            <div className="bg-[#12121a] border border-[#2a2a35] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-[#8b6e3c]" />
                <h3 className="font-semibold text-white">This Month</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {calendarTrips.filter(ct => 
                  ct.startDate.getMonth() === currentDate.getMonth() &&
                  ct.startDate.getFullYear() === currentDate.getFullYear()
                ).length}
              </p>
            </div>
            
            <div className="bg-[#12121a] border border-[#2a2a35] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-[#c7a14a]" />
                <h3 className="font-semibold text-white">Upcoming</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {calendarTrips.filter(ct => ct.startDate > new Date()).length}
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}