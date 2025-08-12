"use client";

import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

/**
 * Creates a new Apollo Client instance configured to talk to the backend GraphQL API
 * and automatically attach the JWT token from cookies as the Authorization header.
 */
export function createApolloClient(): ApolloClient<any> {
  // Keep the original port configuration
  const graphqlUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000/graphql";

  console.log("🔗 GraphQL URL:", graphqlUrl);

  const httpLink = new HttpLink({ 
    uri: graphqlUrl, 
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // Use a custom fetch function to handle potential CORS/network issues
    fetch: async (uri, options) => {
      console.log("🚀 GraphQL Request:", {
        url: uri,
        method: options?.method,
        headers: options?.headers,
        body: options?.body ? JSON.parse(options.body as string) : null
      });
      
      try {
        const response = await fetch(uri, {
          ...options,
          mode: 'cors', // Explicitly set CORS mode
          cache: 'no-cache', // Disable caching for debugging
        });
        
        console.log("📥 GraphQL Response:", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
        
        return response;
      } catch (error) {
        console.error("❌ Fetch Error:", error);
        throw error;
      }
    }
  });

  const authLink = setContext((_, { headers }) => {
    let token: string | null = null;
    if (typeof window !== "undefined") {
      try {
        token = localStorage.getItem("gn_token");
      } catch (e) {
        console.warn("Failed to get token from localStorage:", e);
      }
      if (!token && typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|; )gn_token=([^;]*)/);
        token = match ? decodeURIComponent(match[1]) : null;
      }
    }
    
    console.log("🔐 Auth token:", token ? `Present (${token.substring(0, 10)}...)` : "Missing");
    
    const authHeaders = {
      ...headers,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      authHeaders.authorization = `Bearer ${token}`;
    }

    return {
      headers: authHeaders,
    };
  });

  // Error link to handle GraphQL and network errors
  const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    console.log("🔍 Error Link Triggered:", {
      operation: operation.operationName,
      variables: operation.variables,
      graphQLErrors,
      networkError
    });

    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `❌ [GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );
      });
    }

    if (networkError) {
      console.error(`❌ [Network error]:`, {
        name: networkError.name,
        message: networkError.message,
        stack: networkError.stack,
        networkError
      });
      
      // Handle specific network errors
      if ('statusCode' in networkError) {
        console.log(`Status Code: ${networkError.statusCode}`);
        
        if (networkError.statusCode === 400) {
          console.error("❌ 400 Bad Request - Check query syntax and variables");
        } else if (networkError.statusCode === 401) {
          // Token expired or invalid, clear local storage and redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("gn_token");
            localStorage.removeItem("user");
            // Clear cookie
            document.cookie = 'gn_token=; path=/; max-age=0';
            console.log("🔄 Redirecting to login due to 401 error");
            window.location.href = '/login';
          }
        }
      }
    }
  });

  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            myTrips: {
              merge: false, // Don't merge, replace the data
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        errorPolicy: "all",
        fetchPolicy: "cache-and-network",
        notifyOnNetworkStatusChange: true,
      },
      query: {
        errorPolicy: "all",
        fetchPolicy: "cache-and-network",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
    connectToDevTools: process.env.NODE_ENV !== "production",
  });
}


