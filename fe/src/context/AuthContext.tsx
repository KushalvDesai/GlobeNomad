"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_ME } from "@/graphql/user/queries";
import { User } from "@/types/user";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize token from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        // Don't set isAuthenticated here - wait for query validation
      }
      setInitialLoading(false);
    }
  }, []);

  // Query user data when token exists
  const { data, loading, error, refetch } = useQuery(GET_ME, {
    skip: !token || initialLoading,
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      console.error("GET_ME Query Error:", error);
      console.error("Error message:", error.message);
      console.error("Network error:", error.networkError);
      console.error("GraphQL errors:", error.graphQLErrors);
      
      // Handle different types of errors
      if (error.networkError) {
        setAuthError("Network error: Cannot connect to server. Make sure the backend is running on port 3000.");
      } else if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        setAuthError(`GraphQL error: ${error.graphQLErrors[0].message}`);
      } else {
        setAuthError("Authentication failed. Please login again.");
      }
    },
    onCompleted: (data) => {
      if (data?.me) {
        setIsAuthenticated(true);
        setAuthError(null);
        console.log("User authenticated successfully:", data.me);
      }
    }
  });

  // Update authentication status based on query result
  useEffect(() => {
    if (error && token) {
      // Token is invalid or expired, remove it
      console.log("Authentication error, logging out:", error);
      logout();
    } else if (data?.me && token) {
      setIsAuthenticated(true);
      setAuthError(null);
    }
  }, [data, error, token]);

  const login = (newToken: string) => {
    console.log("Logging in with new token");
    if (typeof window !== "undefined") {
      localStorage.setItem("token", newToken);
    }
    setToken(newToken);
    setAuthError(null);
    // Don't set isAuthenticated here - let the query validate it
  };

  const logout = () => {
    console.log("Logging out");
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setToken(null);
    setIsAuthenticated(false);
    setAuthError(null);
  };

  // Retry connection function
  const retryConnection = () => {
    if (token && refetch) {
      setAuthError(null);
      refetch();
    }
  };

  const value: AuthContextType = {
    user: data?.me || null,
    loading: (loading && !!token) || initialLoading,
    isAuthenticated,
    login,
    logout,
    error: authError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
