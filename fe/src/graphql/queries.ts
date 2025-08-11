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
    userProfile {
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

// Cities list for search suggestions
export const GET_CITIES = gql`
  query GetCities {
    getCities
  }
`;

// Trip by id
export const GET_TRIP = gql`
  query GetTrip($id: ID!) {
    trip(id: $id) {
      id
      title
      description
      startDate
      endDate
      currency
      owner { id }
      createdAt
    }
  }
`;