// User types
export interface User {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// Trip types
export interface Trip {
  id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isPublic: boolean;
  slug?: string;
  estimatedBudget?: number;
  actualBudget?: number;
  currency?: string;
  owner: User;
  createdAt: string;
  updatedAt: string;
}

export interface TripsResponse {
  trips: Trip[];
  total: number;
  hasMore: boolean;
}

// Admin types
export interface AdminDashboardStats {
  totalUsers: number;
  totalTrips: number;
  activeUsers: number;
  publicTrips: number;
}

export interface AdminUsersResponse {
  users: User[];
  total: number;
  hasMore: boolean;
}

export interface AdminTripsResponse {
  trips: Trip[];
  total: number;
  hasMore: boolean;
}

// Itinerary types
export interface Stop {
  id: string;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  country?: string;
  estimatedDuration?: number;
  estimatedCost?: number;
  type: string;
  notes?: string;
}

export interface ItineraryItem {
  id: string;
  day: number;
  order: number;
  stop: Stop;
  startTime?: string;
  endTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Itinerary {
  id: string;
  trip: {
    id: string;
    title: string;
  };
  items: ItineraryItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Cost estimation types
export enum TravelMode {
  FLIGHT = 'FLIGHT',
  TRAIN = 'TRAIN',
  BUS = 'BUS',
  CAR = 'CAR'
}

export interface TripCostInput {
  originCity: string;
  destinationCity: string;
  days: number;
  travelers: number;
  travelMode: TravelMode;
  originCountry: string;
  destinationCountry: string;
}

export interface TripCostEstimate {
  distanceKm: number;
  travelCost: number;
  hotelCost: number;
  mealCost: number;
  totalCost: number;
  originCity: string;
  destinationCity: string;
  days: number;
  travelers: number;
  selectedTravelMode: TravelMode;
  tripType: string;
}

// Input types for mutations
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
}

export interface CreateTripInput {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  currency?: string;
}

export interface UpdateTripInput {
  id: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  currency?: string;
}

export interface CreateStopInput {
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  country?: string;
  estimatedDuration?: number;
  estimatedCost?: number;
  type?: string;
  notes?: string;
}

export interface CreateItineraryItemInput {
  day: number;
  order: number;
  stop: CreateStopInput;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface CreateItineraryInput {
  tripId: string;
  items?: CreateItineraryItemInput[];
  notes?: string;
}

export interface UpdateStopInput {
  id?: string;
  name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  country?: string;
  estimatedDuration?: number;
  estimatedCost?: number;
  type?: string;
  notes?: string;
}

export interface UpdateItineraryItemInput {
  id?: string;
  day?: number;
  order?: number;
  stop?: UpdateStopInput;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface UpdateItineraryInput {
  id: string;
  items?: UpdateItineraryItemInput[];
  notes?: string;
}

export interface AddStopToTripInput {
  tripId: string;
  day: number;
  order: number;
  stop: CreateStopInput;
}

// Response types
export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

// Query variables
export interface GetUserVariables {
  id: string;
}

export interface GetTripVariables {
  id: string;
}

export interface GetPublicTripVariables {
  slug: string;
}

export interface GetItineraryVariables {
  tripId: string;
}

export interface GetMyTripsVariables {
  limit?: number;
  offset?: number;
}

export interface GetAdminUsersVariables {
  limit?: number;
  offset?: number;
}

export interface GetAdminTripsVariables {
  limit?: number;
  offset?: number;
}

export interface UpdateUserRoleVariables {
  userId: string;
  role: UserRole;
}

export interface ToggleUserStatusVariables {
  userId: string;
  isActive: boolean;
}

export interface CreateUserVariables {
  createUserInput: CreateUserDto;
}

export interface LoginVariables {
  loginInput: LoginInput;
}

export interface ForgotPasswordVariables {
  email: string;
}

export interface ResetPasswordVariables {
  token: string;
  newPassword: string;
}

export interface CreateTripVariables {
  createTripInput: CreateTripInput;
}

export interface UpdateTripVariables {
  updateTripInput: UpdateTripInput;
}

export interface DeleteTripVariables {
  id: string;
}

export interface ToggleTripPublicVariables {
  tripId: string;
  isPublic: boolean;
}

export interface CreateItineraryVariables {
  createItineraryInput: CreateItineraryInput;
}

export interface UpdateItineraryVariables {
  updateItineraryInput: UpdateItineraryInput;
}

export interface AddStopToTripVariables {
  addStopInput: AddStopToTripInput;
}

export interface RemoveStopFromTripVariables {
  tripId: string;
  itemId: string;
}

export interface EstimateTripCostVariables {
  tripCostInput: TripCostInput;
}

// Activity types
export interface ActivityCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLocation {
  city: string;
  country: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface ActivityPricing {
  basePrice: number;
  currency: string;
  groupDiscount?: number;
  seasonalMultiplier?: number;
  priceIncludes?: string;
}

export interface ActivityRequirements {
  minAge?: number;
  maxAge?: number;
  fitnessLevel?: string;
  skillLevel?: string;
  equipment?: string[];
  restrictions?: string[];
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  location: ActivityLocation;
  pricing: ActivityPricing;
  duration?: number;
  maxParticipants?: number;
  category: ActivityCategory;
  requirements?: ActivityRequirements;
  images?: string[];
  tags?: string[];
  bestSeasons?: string[];
  operatingHours?: string[];
  contactInfo?: string;
  bookingUrl?: string;
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CityActivityStats {
  city: string;
  country: string;
  totalActivities: number;
  categories: string[];
  averagePrice?: number;
  averageRating?: number;
  currency: string;
}

export interface ActivitiesResponse {
  activities: Activity[];
  total: number;
  hasMore: boolean;
}

// Activity input types
export interface CreateActivityCategoryInput {
  name: string;
  description?: string;
}

export interface CreateActivityInput {
  name: string;
  description: string;
  city: string;
  country: string;
  price: number;
  currency: string;
  duration: number;
  difficulty: string;
  categoryId: string;
  requirements?: string[];
  included?: string[];
  excluded?: string[];
  highlights?: string[];
  images?: string[];
}

export interface GetActivitiesByCityInput {
  city: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  difficulty?: string;
}

export interface SearchActivitiesInput {
  keyword: string;
  city?: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  minPrice?: number;
  maxPrice?: number;
  difficulty?: string;
}

// Activity query variables
export interface GetActivitiesByCityVariables {
  input: GetActivitiesByCityInput;
}

export interface SearchActivitiesVariables {
  input: SearchActivitiesInput;
}

export interface GetActivitiesVariables {
  limit?: number;
  offset?: number;
}

export interface GetActivityVariables {
  id: string;
}

export interface CreateActivityCategoryVariables {
  input: CreateActivityCategoryInput;
}

export interface CreateActivityVariables {
  input: CreateActivityInput;
}

// Activity Filter Input
export interface ActivityFiltersInput {
  city?: string;
  country?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  maxDuration?: number;
  fitnessLevel?: string;
  skillLevel?: string;
  tags?: string[];
  seasons?: string[];
  minRating?: number;
  limit?: number;
  offset?: number;
  sortBy?: string; // price, rating, duration, name
  sortOrder?: string; // asc, desc
}
