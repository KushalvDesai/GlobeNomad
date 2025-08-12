'use client';

import { Activity } from '@/graphql/types';
import { MapPin, Clock, Users, Star } from 'lucide-react';
import Link from 'next/link';

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
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

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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

  return (
    <Link href={`/activities/${activity.id}`}>
      <div className="card card-hover cursor-pointer overflow-hidden">
        {/* Image placeholder */}
        <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative">
          {activity.images && activity.images.length > 0 ? (
            <img
              src={activity.images[0]}
              alt={activity.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <MapPin className="w-12 h-12 text-white opacity-50" />
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
            <div className="absolute top-3 left-3 bg-black bg-opacity-70 rounded-full px-2 py-1 flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                {activity.rating.toFixed(1)}
              </span>
              {activity.reviewCount && (
                <span className="text-xs" style={{ color: 'var(--foreground)' }}>
                  ({activity.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Header */}
          <div className="mb-3">
            <h3 className="font-semibold text-lg mb-1 line-clamp-2" style={{ color: 'var(--foreground)' }}>
              {activity.name}
            </h3>
            <div className="flex items-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
              <MapPin className="w-4 h-4 mr-1" style={{ color: 'var(--muted-foreground)' }} />
              <span>{activity.location.city}, {activity.location.country}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>
            {activity.description}
          </p>

          {/* Category */}
          <div className="mb-3">
            <span 
              className="inline-block text-xs px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: 'var(--accent-1)', 
                color: 'var(--background)' 
              }}
            >
              {activity.category.name}
            </span>
          </div>

          {/* Details */}
          <div className="flex items-center justify-between text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" style={{ color: 'var(--muted-foreground)' }} />
              <span>{formatDuration(activity.duration)}</span>
            </div>
            {activity.maxParticipants && (
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" style={{ color: 'var(--muted-foreground)' }} />
                <span>Max {activity.maxParticipants}</span>
              </div>
            )}
          </div>

          {/* Price - simplified without dollar icon and button */}
          <div className="mb-4">
            <div className="text-lg font-semibold" style={{ color: 'var(--accent-1)' }}>
              {formatPrice(activity.pricing.basePrice, activity.pricing.currency)}
            </div>
          </div>

          {/* Tags preview */}
          {activity.tags && activity.tags.length > 0 && (
            <div className="pt-3" style={{ borderTop: '1px solid var(--muted)' }}>
              <p className="text-xs line-clamp-1" style={{ color: 'var(--muted-foreground)' }}>
                Tags: {activity.tags.slice(0, 3).join(', ')}
                {activity.tags.length > 3 && '...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}