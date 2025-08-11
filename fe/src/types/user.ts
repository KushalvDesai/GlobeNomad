export interface User {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  city?: string;
  country?: string;
  phoneNumber?: string;
  additionalInfo?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
