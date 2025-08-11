import { gql } from '@apollo/client';

// User Registration  
export const CREATE_USER = gql`
  mutation CreateUser($createUserInput: CreateUserDto!) {
    createUser(createUserInput: $createUserInput) {
      id
      name
      email
      firstName
      lastName
      phoneNumber
      city
      country
    }
  }
`;

// User Login
export const LOGIN = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      token
      user {
        id
        email
        name
        firstName
        lastName
      }
    }
  }
`;

// Forgot Password
export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

// Reset Password
export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

// Update User Role (Admin only)
export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: String!, $role: UserRole!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      name
      email
      firstName
      lastName
      role
      isActive
      city
      country
      phoneNumber
      updatedAt
    }
  }
`;

// Toggle User Status (Admin only)
export const TOGGLE_USER_STATUS = gql`
  mutation ToggleUserStatus($userId: String!, $isActive: Boolean!) {
    toggleUserStatus(userId: $userId, isActive: $isActive) {
      id
      name
      email
      firstName
      lastName
      role
      isActive
      city
      country
      phoneNumber
      updatedAt
    }
  }
`;

// Create Trip
export const CREATE_TRIP = gql`
  mutation CreateTrip($createTripInput: CreateTripInput!) {
    createTrip(createTripInput: $createTripInput) {
      id
      title
      description
      startDate
      endDate
      currency
      owner {
        id
      }
      createdAt
    }
  }
`;

// Update Trip
export const UPDATE_TRIP = gql`
  mutation UpdateTrip($updateTripInput: UpdateTripInput!) {
    updateTrip(updateTripInput: $updateTripInput) {
      id
      title
      description
      startDate
      endDate
      currency
      updatedAt
    }
  }
`;

// Delete Trip
export const DELETE_TRIP = gql`
  mutation DeleteTrip($id: String!) {
    deleteTrip(id: $id)
  }
`;

// Toggle Trip Public Status
export const TOGGLE_TRIP_PUBLIC = gql`
  mutation ToggleTripPublic($tripId: String!, $isPublic: Boolean!) {
    toggleTripPublic(tripId: $tripId, isPublic: $isPublic)
  }
`;

// Estimate Trip Cost
export const ESTIMATE_TRIP_COST = gql`
  mutation EstimateTripCost($tripCostInput: TripCostInput!) {
    estimateTripCost(tripCostInput: $tripCostInput) {
      distanceKm
      travelCost
      hotelCost
      mealCost
      totalCost
      originCity
      destinationCity
      days
      travelers
      selectedTravelMode
      tripType
    }
  }
`;

// Create Itinerary
export const CREATE_ITINERARY = gql`
  mutation CreateItinerary($createItineraryInput: CreateItineraryInput!) {
    createItinerary(createItineraryInput: $createItineraryInput) {
      id
      trip {
        id
        title
      }
      items {
        id
        day
        order
        stop {
          id
          name
          description
          city
          country
          latitude
          longitude
          address
          estimatedDuration
          estimatedCost
          type
          notes
        }
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

// Update Itinerary
export const UPDATE_ITINERARY = gql`
  mutation UpdateItinerary($updateItineraryInput: UpdateItineraryInput!) {
    updateItinerary(updateItineraryInput: $updateItineraryInput) {
      id
      trip {
        id
        title
      }
      items {
        id
        day
        order
        stop {
          id
          name
          description
          city
          country
          latitude
          longitude
          address
          estimatedDuration
          estimatedCost
          type
          notes
        }
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

// Add Stop to Trip
export const ADD_STOP_TO_TRIP = gql`
  mutation AddStopToTrip($addStopInput: AddStopToTripInput!) {
    addStopToTrip(addStopInput: $addStopInput) {
      id
      trip {
        id
        title
      }
      items {
        id
        day
        order
        stop {
          id
          name
          description
          city
          country
          latitude
          longitude
          address
          estimatedDuration
          estimatedCost
          type
          notes
        }
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

// Remove Stop from Trip
export const REMOVE_STOP_FROM_TRIP = gql`
  mutation RemoveStopFromTrip($tripId: ID!, $itemId: ID!) {
    removeStopFromTrip(tripId: $tripId, itemId: $itemId) {
      id
      trip {
        id
        title
      }
      items {
        id
        day
        order
        stop {
          id
          name
          description
          city
          country
          latitude
          longitude
          address
          estimatedDuration
          estimatedCost
          type
          notes
        }
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
