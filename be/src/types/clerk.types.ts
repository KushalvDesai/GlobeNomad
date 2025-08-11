export interface ClerkUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: number;
}

export interface AuthenticatedRequest {
  headers: {
    authorization?: string;
  };
  user?: ClerkUser;
}

export interface GraphQLContext {
  req: AuthenticatedRequest;
}
