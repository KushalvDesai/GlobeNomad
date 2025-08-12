import { gql } from '@apollo/client';

// Get all users
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      firstName
      lastName
      createdAt
      updatedAt
    }
  }
`;

// Get single user by ID
export const GET_USER = gql`
  query GetUser($id: String!) {
    user(id: $id) {
      id
      name
      email
      firstName
      lastName
      createdAt
      updatedAt
    }
  }
`;

// Get user profile (for authenticated user)
export const GET_USER_PROFILE = gql`
  query GetUserProfile {
    me {
      id
      name
      email
      firstName
      lastName
      phoneNumber
      city
      country
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

// Admin Queries
export const GET_ADMIN_DASHBOARD = gql`
  query GetAdminDashboard {
    adminDashboard {
      totalUsers
      totalTrips
      activeUsers
      publicTrips
    }
  }
`;

export const GET_ADMIN_USERS = gql`
  query GetAdminUsers($limit: Int, $offset: Int) {
    adminUsers(limit: $limit, offset: $offset) {
      users {
        id
        name
        email
        firstName
        lastName
        role
        isActive
        createdAt
        updatedAt
      }
      total
      hasMore
    }
  }
`;

export const GET_ADMIN_TRIPS = gql`
  query GetAdminTrips($limit: Int, $offset: Int) {
    adminTrips(limit: $limit, offset: $offset) {
      trips {
        id
        title
        description
        isPublic
        owner {
          id
          email
        }
        createdAt
        updatedAt
      }
      total
      hasMore
    }
  }
`;

// Get itinerary for a trip (detailed)
export const GET_ITINERARY_DETAILED = gql`
  query GetItinerary($tripId: ID!) {
    getItinerary(tripId: $tripId) {
      id
      trip { id title }
      items {
        id
        day
        order
        stop { id name description latitude longitude address city country estimatedDuration estimatedCost type notes }
        startTime
        endTime
        notes
        createdAt
        updatedAt
      }
      notes
      createdAt
      updatedAt
    }
  }
`;

// Cities list for search suggestions
export const GET_CITIES = gql`
  query GetCities {
    getCities
  }
`;

// Itinerary by trip (compact)
export const GET_ITINERARY = gql`
  query GetItinerary($tripId: ID!) {
    getItinerary(tripId: $tripId) {
      id
      items {
        id
        day
        order
        stop {
          id
          name
          description
          city
          estimatedCost
          estimatedDuration
          type
          notes
        }
        startTime
        endTime
        notes
      }
      notes
    }
  }
`;

// Get user's trips
export const GET_MY_TRIPS = gql`
  query GetMyTrips($limit: Int, $offset: Int) {
    myTrips(limit: $limit, offset: $offset) {
      trips {
        id
        title
        description
        startDate
        endDate
        isPublic
        slug
        estimatedBudget
        actualBudget
        currency
        owner {
          id
          email
        }
        createdAt
        updatedAt
      }
      total
      hasMore
    }
  }
`;

// Get trip by ID
export const GET_TRIP = gql`
  query GetTrip($id: ID!) {
    trip(id: $id) {
      id
      title
      description
      startDate
      endDate
      isPublic
      slug
      estimatedBudget
      actualBudget
      currency
      owner {
        id
        email
      }
      createdAt
      updatedAt
    }
  }
`;

// Get public trip by slug
export const GET_PUBLIC_TRIP = gql`
  query GetPublicTrip($slug: String!) {
    publicTrip(slug: $slug) {
      id
      title
      description
      startDate
      endDate
      isPublic
      slug
      estimatedBudget
      actualBudget
      currency
      owner {
        id
        email
      }
      createdAt
      updatedAt
    }
  }
`;

// Activity Queries
export const GET_ACTIVITIES = gql`
  query GetActivities($filters: ActivityFiltersInput) {
    getActivities(filters: $filters) {
      id
      name
      description
      location {
        city
        country
        state
        latitude
        longitude
        address
      }
      pricing {
        basePrice
        currency
        groupDiscount
        seasonalMultiplier
        priceIncludes
      }
      duration
      maxParticipants
      category {
        id
        name
        description
      }
      requirements {
        minAge
        maxAge
        fitnessLevel
        skillLevel
        equipment
        restrictions
      }
      images
      tags
      bestSeasons
      operatingHours
      contactInfo
      bookingUrl
      rating
      reviewCount
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_ACTIVITIES_BY_CITY = gql`
  query GetActivitiesByCity($city: String!, $filters: ActivityFiltersInput) {
    getActivitiesByCity(city: $city, filters: $filters) {
      id
      name
      description
      location {
        city
        country
        state
        latitude
        longitude
        address
      }
      pricing {
        basePrice
        currency
        groupDiscount
        seasonalMultiplier
        priceIncludes
      }
      duration
      maxParticipants
      category {
        id
        name
        description
      }
      requirements {
        minAge
        maxAge
        fitnessLevel
        skillLevel
        equipment
        restrictions
      }
      images
      tags
      bestSeasons
      operatingHours
      contactInfo
      bookingUrl
      rating
      reviewCount
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const SEARCH_ACTIVITIES = gql`
  query SearchActivities($searchTerm: String!, $filters: ActivityFiltersInput) {
    searchActivities(searchTerm: $searchTerm, filters: $filters) {
      id
      name
      description
      location {
        city
        country
        state
        latitude
        longitude
        address
      }
      pricing {
        basePrice
        currency
        groupDiscount
        seasonalMultiplier
        priceIncludes
      }
      duration
      maxParticipants
      category {
        id
        name
        description
      }
      requirements {
        minAge
        maxAge
        fitnessLevel
        skillLevel
        equipment
        restrictions
      }
      images
      tags
      bestSeasons
      operatingHours
      contactInfo
      bookingUrl
      rating
      reviewCount
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_ACTIVITY_CATEGORIES = gql`
  query GetActivityCategories {
    getActivityCategories {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;

export const GET_CITY_ACTIVITY_STATS = gql`
  query GetCityActivityStats {
    getCityActivityStats {
      city
      country
      totalActivities
      categories
      averagePrice
      currency
    }
  }
`;

export const GET_ACTIVITY = gql`
  query GetActivity($id: ID!) {
    getActivity(id: $id) {
      id
      name
      description
      city
      country
      price
      currency
      duration
      difficulty
      category {
        id
        name
        description
      }
      requirements
      included
      excluded
      highlights
      images
      rating
      reviewCount
      isActive
      createdAt
      updatedAt
    }
  }
`;