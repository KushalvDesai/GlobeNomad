"use client";

import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

/**
 * Creates a new Apollo Client instance configured to talk to the backend GraphQL API
 * and automatically attach the JWT token from cookies as the Authorization header.
 */
export function createApolloClient(): ApolloClient<any> {
  // Prefer explicit env; otherwise default to localhost:3000/graphql
  const graphqlUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000/graphql";

  const httpLink = new HttpLink({ uri: graphqlUrl, credentials: "include" });

  const authLink = setContext((_, { headers }) => {
    let token: string | null = null;
    if (typeof window !== "undefined") {
      try {
        token = localStorage.getItem("gn_token");
      } catch {}
      if (!token && typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|; )gn_token=([^;]*)/);
        token = match ? decodeURIComponent(match[1]) : null;
      }
    }
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  return new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
    connectToDevTools: process.env.NODE_ENV !== "production",
  });
}


