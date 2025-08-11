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

// Update User Profile
// export const UPDATE_USER_PROFILE = gql`
//   mutation UpdateUserProfile($updateUserInput: UpdateUserInput!) {
//     updateUserProfile(updateUserInput: $updateUserInput) {
//       id
//       name
//       email
//       firstName
//       lastName
//       phoneNumber
//       city
//       country
//       updatedAt
//     }
//   }
// `;

// Refresh Token
export const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      token
      user {
        id
        email
        name
        firstName
        lastName
        role
        isActive
      }
    }
  }
`;

// Itinerary
export const CREATE_ITINERARY = gql`
  mutation CreateItinerary($createItineraryInput: CreateItineraryInput!) {
    createItinerary(createItineraryInput: $createItineraryInput) {
      id
      items {
        id
        day
        order
        stop {
          id
          name
          city
          description
          type
        }
        startTime
        endTime
        notes
      }
      notes
    }
  }
`;

// Trips
export const CREATE_TRIP = gql`
  mutation CreateTrip($input: CreateTripInput!) {
    createTrip(createTripInput: $input) {
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
