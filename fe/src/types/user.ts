export interface User {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
