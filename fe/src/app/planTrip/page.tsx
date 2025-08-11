"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, DollarSign, X, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../components/Header";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

function DatePicker({ selectedDate, onDateSelect, onClose }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentMonth && 
        selectedDate.getFullYear() === currentYear;
      
      days.push(
        <button
          key={day}
          onClick={() => onDateSelect(date)}
          className={`w-8 h-8 rounded-md text-sm transition-all hover:bg-[#2a2a35] ${
            isSelected 
              ? "bg-[#6366f1] text-white" 
              : "text-[#E6E8EB] hover:text-white"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#15151f] border border-[#2a2a35] rounded-lg p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Select Date</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[#2a2a35] text-[#9AA0A6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month/Year navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-md hover:bg-[#2a2a35] text-[#E6E8EB]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-white font-medium">
            {months[currentMonth]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-md hover:bg-[#2a2a35] text-[#E6E8EB]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="w-8 h-8 flex items-center justify-center text-sm text-[#9AA0A6]">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </div>
    </motion.div>
  );
}

export default function PlanTrip() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [destination, setDestination] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [budget, setBudget] = useState("");

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const parseDate = (dateString: string) => {
    const [day, month, year] = dateString.split("/");
    if (day && month && year) {
      const fullYear = parseInt(year) + (parseInt(year) > 50 ? 1900 : 2000);
      return new Date(fullYear, parseInt(month) - 1, parseInt(day));
    }
    return null;
  };

  const handleStartDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDateInput(value);
    const date = parseDate(value);
    if (date) {
      setStartDate(date);
    }
  };

  const handleEndDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDateInput(value);
    const date = parseDate(value);
    if (date) {
      setEndDate(date);
    }
  };

  const handleStartDateSelect = (date: Date) => {
    setStartDate(date);
    setStartDateInput(formatDate(date));
    setShowStartDatePicker(false);
  };

  const handleEndDateSelect = (date: Date) => {
    setEndDate(date);
    setEndDateInput(formatDate(date));
    setShowEndDatePicker(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB]">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Plan Your Trip</h1>
          <p className="text-[#9AA0A6]">Create your perfect travel itinerary</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#15151f]/70 backdrop-blur-lg border border-[#2a2a35] rounded-xl p-8 shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Destination */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#E6E8EB] flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where do you want to go?"
                className="w-full px-4 py-3 bg-[#1a1a26] border border-[#2a2a35] rounded-lg text-white placeholder-[#9AA0A6] focus:border-[#6366f1] focus:outline-none transition-colors"
              />
            </div>

            {/* Number of Travelers */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#E6E8EB] flex items-center gap-2">
                <Users className="w-4 h-4" />
                Travelers
              </label>
              <select
                value={travelers}
                onChange={(e) => setTravelers(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-[#1a1a26] border border-[#2a2a35] rounded-lg text-white focus:border-[#6366f1] focus:outline-none transition-colors"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "Traveler" : "Travelers"}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#E6E8EB] flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={startDateInput}
                  onChange={handleStartDateInputChange}
                  placeholder="DD/MM/YY"
                  className="flex-1 px-4 py-3 bg-[#1a1a26] border border-[#2a2a35] rounded-lg text-white placeholder-[#9AA0A6] focus:border-[#6366f1] focus:outline-none transition-colors"
                />
                <button
                  onClick={() => setShowStartDatePicker(true)}
                  className="px-4 py-3 bg-[#6366f1] hover:bg-[#5856eb] rounded-lg transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#E6E8EB] flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                End Date
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={endDateInput}
                  onChange={handleEndDateInputChange}
                  placeholder="DD/MM/YY"
                  className="flex-1 px-4 py-3 bg-[#1a1a26] border border-[#2a2a35] rounded-lg text-white placeholder-[#9AA0A6] focus:border-[#6366f1] focus:outline-none transition-colors"
                />
                <button
                  onClick={() => setShowEndDatePicker(true)}
                  className="px-4 py-3 bg-[#6366f1] hover:bg-[#5856eb] rounded-lg transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[#E6E8EB] flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget (Optional)
              </label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Enter your budget range"
                className="w-full px-4 py-3 bg-[#1a1a26] border border-[#2a2a35] rounded-lg text-white placeholder-[#9AA0A6] focus:border-[#6366f1] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 bg-[#6366f1] hover:bg-[#5856eb] rounded-lg font-medium transition-colors"
            >
              Create Itinerary
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-[#1a1a26] hover:bg-[#2a2a35] border border-[#2a2a35] rounded-lg font-medium transition-colors"
            >
              Save as Draft
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DatePicker
          selectedDate={startDate}
          onDateSelect={handleStartDateSelect}
          onClose={() => setShowStartDatePicker(false)}
        />
      )}

      {showEndDatePicker && (
        <DatePicker
          selectedDate={endDate}
          onDateSelect={handleEndDateSelect}
          onClose={() => setShowEndDatePicker(false)}
        />
      )}
    </div>
  );
}
