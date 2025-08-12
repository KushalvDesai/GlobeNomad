'use client';

import { useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';
import { GET_ACTIVITY } from '@/graphql/queries';
import { Activity } from '@/graphql/types';
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Calendar,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function ActivityDetailPage() {
  const params = useParams();
  const activityId = params.id as string;

  const { data, loading, error } = useQuery(GET_ACTIVITY, {
    variables: { id: activityId },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading activity details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Activity
          </h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Link
            href="/activities"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Activities
          </Link>
        </div>
      </div>
    );
  }

  const activity: Activity = data?.getActivity;

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Activity Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The activity you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/activities"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Activities
          </Link>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const formatDuration = (duration: number) => {
    if (duration < 60) {
      return `${duration} minutes`;
    } else if (duration < 1440) {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours} hours ${minutes} minutes` : `${hours} hours`;
    } else {
      const days = Math.floor(duration / 1440);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/activities"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Activities
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            <div className="h-96 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-8 relative overflow-hidden">
              {activity.images && activity.images.length > 0 ? (
                <img
                  src={activity.images[0]}
                  alt={activity.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <MapPin className="w-24 h-24 text-white opacity-50" />
                </div>
              )}
              
              {/* Overlay badges */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(activity.requirements?.fitnessLevel)}`}>
                  {activity.requirements?.fitnessLevel || 'Not specified'}
                </span>
                {activity.rating && (
                  <div className="bg-white bg-opacity-90 rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900">
                      {activity.rating.toFixed(1)}
                    </span>
                    {activity.reviewCount && (
                      <span className="text-sm text-gray-600">
                        ({activity.reviewCount})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Activity Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {activity.name}
                </h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{activity.location.city}, {activity.location.country}</span>
                </div>
                <div className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {activity.category.name}
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {activity.description}
                </p>
              </div>
            </div>

            {/* Highlights */}
            {activity.highlights && activity.highlights.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-500" />
                  Highlights
                </h2>
                <ul className="space-y-2">
                  {activity.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What's Included & Excluded */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {activity.included && activity.included.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    What's Included
                  </h3>
                  <ul className="space-y-2">
                    {activity.included.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activity.excluded && activity.excluded.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <XCircle className="w-5 h-5 mr-2 text-red-500" />
                    What's Not Included
                  </h3>
                  <ul className="space-y-2">
                    {activity.excluded.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Requirements */}
            {activity.requirements && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-500" />
                  Requirements
                </h2>
                <div className="space-y-3">
                  {activity.requirements.fitnessLevel && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Fitness Level</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.requirements.fitnessLevel)}`}>
                        {activity.requirements.fitnessLevel}
                      </span>
                    </div>
                  )}
                  {activity.requirements.ageRestriction && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Age Restriction</span>
                      <span className="font-medium text-gray-900">{activity.requirements.ageRestriction}</span>
                    </div>
                  )}
                  {activity.requirements.equipment && activity.requirements.equipment.length > 0 && (
                    <div>
                      <span className="text-gray-600 block mb-2">Required Equipment</span>
                      <ul className="space-y-1">
                        {activity.requirements.equipment.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {activity.requirements.prerequisites && activity.requirements.prerequisites.length > 0 && (
                    <div>
                      <span className="text-gray-600 block mb-2">Prerequisites</span>
                      <ul className="space-y-1">
                        {activity.requirements.prerequisites.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Booking Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatPrice(activity.pricing.basePrice, activity.pricing.currency)}
                  </div>
                  <div className="text-gray-600">per person</div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Duration</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatDuration(activity.duration)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center text-gray-600">
                      <Award className="w-4 h-4 mr-2" />
                      <span>Difficulty</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.requirements?.fitnessLevel)}`}>
                      {activity.requirements?.fitnessLevel || 'Not specified'}
                    </span>
                  </div>

                  {activity.rating && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center text-gray-600">
                        <Star className="w-4 h-4 mr-2" />
                        <span>Rating</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 mr-1">
                          {activity.rating.toFixed(1)}
                        </span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        {activity.reviewCount && (
                          <span className="text-sm text-gray-600 ml-1">
                            ({activity.reviewCount})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-3">
                  Book Now
                </button>
                
                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Add to Trip
                </button>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium text-gray-900">
                      {activity.location.city}, {activity.location.country}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium text-gray-900">
                      {activity.category.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Currency</span>
                    <span className="font-medium text-gray-900">
                      {activity.pricing.currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {activity.isActive ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}