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
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
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

export interface UpdateUserRoleVariables {
  userId: string;
  role: UserRole;
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

export interface UpdateUserProfileVariables {
  updateUserInput: UpdateUserInput;
}
