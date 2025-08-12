'use client';

import { Activity } from '@/graphql/types';
import { MapPin, Clock, Users, Star, Plus } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  tripId?: string | null;
  onAddToTrip?: (activity: Activity) => void;
  onActivityClick?: (activity: Activity) => void;
}

export default function ActivityCard({ activity, tripId, onAddToTrip, onActivityClick }: ActivityCardProps) {
  const getDifficultyColor = (difficulty?: string) => {
    if (!difficulty) return 'bg-gray-600 text-gray-200';
    
    switch (difficulty.toLowerCase()) {
      case 'easy':
      case 'beginner':
        return 'bg-green-600 text-green-100';
      case 'moderate':
      case 'intermediate':
        return 'bg-yellow-600 text-yellow-100';
      case 'hard':
      case 'advanced':
        return 'bg-red-600 text-red-100';
      default:
        return 'bg-gray-600 text-gray-200';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'Duration not specified';
    
    if (duration < 60) {
      return `${duration} min`;
    } else if (duration < 1440) {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    } else {
      const days = Math.floor(duration / 1440);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

  const handleAddToTrip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToTrip) {
      onAddToTrip(activity);
    }
  };

  const handleCardClick = () => {
    if (onActivityClick) {
      onActivityClick(activity);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-[#0f0f17] border border-[#2a2a35] rounded-lg overflow-hidden cursor-pointer hover:border-[#27C3FF]/50 hover:bg-[#14141c] transition-all duration-200"
    >
      {/* Image placeholder */}
      <div className="h-48 bg-gradient-to-br from-[#27C3FF]/20 to-[#c7a14a]/20 relative">
        {activity.images && activity.images.length > 0 ? (
          <img
            src={activity.images[0]}
            alt={activity.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <MapPin className="w-12 h-12 text-[#9AA0A6] opacity-50" />
          </div>
        )}
        
        {/* Difficulty badge */}
        {activity.requirements?.fitnessLevel && (
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.requirements.fitnessLevel)}`}>
              {activity.requirements.fitnessLevel}
            </span>
          </div>
        )}

        {/* Rating badge */}
        {activity.rating && (
          <div className="absolute top-3 left-3 bg-black/70 rounded-full px-2 py-1 flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs font-medium text-[#E6E8EB]">
              {activity.rating.toFixed(1)}
            </span>
            {activity.reviewCount && (
              <span className="text-xs text-[#E6E8EB]">
                ({activity.reviewCount})
              </span>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 text-[#E6E8EB]">
            {activity.name}
          </h3>
          <div className="flex items-center text-sm text-[#9AA0A6]">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{activity.location.city}, {activity.location.country}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm mb-4 line-clamp-2 text-[#9AA0A6]">
          {activity.description}
        </p>

        {/* Category */}
        <div className="mb-3">
          <span 
            className="inline-block text-xs px-2 py-1 rounded-full bg-[#27C3FF]/20 text-[#27C3FF] border border-[#27C3FF]/30"
          >
            {activity.category.name}
          </span>
        </div>

        {/* Details */}
        <div className="flex items-center justify-between text-sm mb-4 text-[#9AA0A6]">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{formatDuration(activity.duration)}</span>
          </div>
          {activity.maxParticipants && (
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>Max {activity.maxParticipants}</span>
            </div>
          )}
        </div>

        {/* Price and Add to Trip Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold text-[#c7a14a]">
            ₹{activity.pricing.basePrice.toLocaleString()}
          </div>
          
          {tripId && onAddToTrip && (
            <button
              onClick={handleAddToTrip}
              className="px-3 py-1 rounded-md bg-[#c7a14a] text-white hover:bg-[#c7a14a]/90 transition-colors inline-flex items-center gap-1 text-sm"
            >
              <Plus className="w-3 h-3" />
              Add to Trip
            </button>
          )}
        </div>

        {/* Tags preview */}
        {activity.tags && activity.tags.length > 0 && (
          <div className="pt-3 border-t border-[#2a2a35]">
            <p className="text-xs line-clamp-1 text-[#9AA0A6]">
              Tags: {activity.tags.slice(0, 3).join(', ')}
              {activity.tags.length > 3 && '...'}
            </p>
          </div>
        )}

        {/* Click hint */}
        <div className="pt-2 text-center">
          <p className="text-xs text-[#27C3FF] opacity-70">
            Click to create trip with this activity
          </p>
        </div>
      </div>
    </div>
  );
}