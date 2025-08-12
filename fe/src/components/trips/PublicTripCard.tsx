import { motion } from "framer-motion";
import { Calendar, MapPin, DollarSign, Clock, User, Heart, Share2, Route } from "lucide-react";
import { PublicTrip } from "@/graphql/types";

interface PublicTripCardProps {
  trip: PublicTrip;
  onClick?: () => void;
}

export function PublicTripCard({ trip, onClick }: PublicTripCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDuration = () => {
    if (!trip.startDate || !trip.endDate) return null;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#12121a] rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-[#2a2a35] hover:transform hover:-translate-y-1"
    >
      {/* Header with user info */}
      <div className="p-4 border-b border-[#2a2a35]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#c7a14a] to-[#8b6e3c] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-[#E6E8EB]">
                {trip.owner.email.split('@')[0]}
              </p>
              <p className="text-sm text-[#9AA0A6]">
                Shared {getRelativeTime(trip.createdAt || new Date().toISOString())}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-[#14141c] rounded-full transition-colors">
              <Share2 className="w-4 h-4 text-[#9AA0A6]" />
            </button>
          </div>
        </div>
      </div>

      {/* Trip content */}
      <div className="p-4 cursor-pointer hover:bg-[#14141c] transition-colors" onClick={onClick}>
        {/* Trip Title */}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
          {trip.title}
        </h3>

        {/* Trip Description */}
        {trip.description && (
          <p className="text-[#9AA0A6] text-sm mb-4 line-clamp-3 leading-relaxed">
            {trip.description}
          </p>
        )}

        {/* Click to view hint */}
        <div className="flex items-center gap-2 text-xs text-[#5a5a5a] mb-3">
          <Route className="w-3 h-3" />
          <span>Click to view itinerary</span>
        </div>

        {/* Trip Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Dates */}
          <div className="flex items-center gap-2 text-sm text-[#E6E8EB]">
            <Calendar className="w-4 h-4 text-[#c7a14a]" />
            <div>
              <p className="font-medium">Dates</p>
              <p className="text-xs text-[#9AA0A6]">
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </p>
            </div>
          </div>

          {/* Duration */}
          {getDuration() && (
            <div className="flex items-center gap-2 text-sm text-[#E6E8EB]">
              <Clock className="w-4 h-4 text-[#8b6e3c]" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-xs text-[#9AA0A6]">{getDuration()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Budget if available */}
        {trip.estimatedBudget && (
          <div className="bg-[#15151f] border border-[#2a2a35] rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-[#c7a14a]" />
              <span className="font-medium text-[#E6E8EB]">
                Estimated Budget: {trip.currency || "USD"} {trip.estimatedBudget.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Engagement Footer */}
      <div className="px-4 py-3 border-t border-[#2a2a35] bg-[#0f0f17]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-[#9AA0A6] hover:text-red-400 transition-colors">
              <Heart className="w-4 h-4" />
              <span className="text-sm">Like</span>
            </button>
            <button className="flex items-center gap-2 text-[#9AA0A6] hover:text-[#c7a14a] transition-colors">
              <Route className="w-4 h-4" />
              <span className="text-sm">View Itinerary</span>
            </button>
          </div>
          <div className="text-xs text-[#5a5a5a]">
            Trip ID: {trip.id.slice(0, 8)}...
          </div>
        </div>
      </div>
    </motion.div>
  );
}