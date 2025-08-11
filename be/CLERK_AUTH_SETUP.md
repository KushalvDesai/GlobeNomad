# Clerk Authentication Setup for NestJS Backend

This guide explains how to use the Clerk authentication system implemented in your NestJS GraphQL backend.

## Overview

The backend now supports Clerk JWT token verification and automatic user synchronization with MongoDB. Users authenticated through your Next.js frontend with Clerk can seamlessly access protected GraphQL endpoints.

## Environment Variables

Ensure your `.env` file contains:

```bash
CLERK_PUBLISHABLE_KEY=pk_test_c3F1YXJlLXdlYXNlbC00NS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_TdLtZfHUDAqnVBBWj3OHOQaxskowoyOUje6WzUSbXv
MONGO_URI=mongodb+srv://shreylakhatariacode:GlobeNomad@1234@globenomad.b0nsayz.mongodb.net/
```

## How It Works

### 1. Authentication Flow

1. **Frontend**: User logs in through Clerk in your Next.js app
2. **Token**: Clerk provides a JWT token
3. **Backend Request**: Frontend sends GraphQL requests with `Authorization: Bearer <token>` header
4. **Verification**: `ClerkAuthGuard` verifies the token with Clerk
5. **User Sync**: If first login, user data is synced to MongoDB
6. **Access**: User can access protected resolvers

### 2. Protected Routes

Use the `@UseGuards(ClerkAuthGuard)` decorator on any resolver that requires authentication:

```typescript
@Query(() => [User])
@UseGuards(ClerkAuthGuard)
async users(): Promise<User[]> {
  return this.userService.findAll();
}
```

### 3. Accessing Current User

Use the `@CurrentUser()` decorator to get the authenticated user:

```typescript
@Query(() => User)
@UseGuards(ClerkAuthGuard)
async me(@CurrentUser() user: any): Promise<User> {
  return this.userService.findByClerkId(user.id);
}
```

## Available GraphQL Operations

### Queries

```graphql
# Get all users (protected)
query {
  users {
    id
    clerkId
    name
    email
    firstName
    lastName
    imageUrl
    createdAt
    updatedAt
  }
}

# Get current user (protected)
query {
  me {
    id
    clerkId
    name
    email
    firstName
    lastName
    imageUrl
  }
}

# Get specific user (protected)
query {
  user(id: "user_id_here") {
    id
    name
    email
  }
}
```

### Mutations

```graphql
# Sync current user with Clerk (protected)
mutation {
  syncUser {
    id
    clerkId
    name
    email
    firstName
    lastName
    imageUrl
  }
}

# Create user manually (public)
mutation {
  createUser(createUserInput: {
    clerkId: "user_clerk_id"
    name: "John Doe"
    email: "john@example.com"
    firstName: "John"
    lastName: "Doe"
  }) {
    id
    name
    email
  }
}
```

## Frontend Integration

In your Next.js frontend, include the Clerk token in GraphQL requests:

```typescript
import { useAuth } from '@clerk/nextjs';

const { getToken } = useAuth();

const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  headers: {
    authorization: `Bearer ${await getToken()}`
  }
});
```

## User Schema

The User model includes these fields:

- `id`: MongoDB ObjectId
- `clerkId`: Unique Clerk user identifier
- `name`: Full name
- `email`: Email address (unique)
- `firstName`: First name (optional)
- `lastName`: Last name (optional)
- `imageUrl`: Profile image URL (optional)
- `rollNo`: Roll number (optional)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Error Handling

The auth guard will throw `UnauthorizedException` for:

- Missing Authorization header
- Invalid Bearer token format
- Expired or invalid Clerk token
- Network issues with Clerk verification

## Testing

1. Start your backend: `npm run start:dev`
2. Visit GraphQL Playground: `http://localhost:3000/graphql`
3. Add Authorization header: `{"Authorization": "Bearer YOUR_CLERK_TOKEN"}`
4. Run protected queries/mutations

## Security Features

- ✅ JWT token verification with Clerk
- ✅ Automatic token expiration handling
- ✅ User data synchronization
- ✅ Protected GraphQL endpoints
- ✅ Environment variable security
- ✅ MongoDB integration with proper schemas

## Next Steps

1. **Role-Based Access**: Extend the auth guard to support user roles
2. **Permissions**: Add fine-grained permissions for different operations
3. **Caching**: Implement user data caching for better performance
4. **Webhooks**: Set up Clerk webhooks for real-time user updates