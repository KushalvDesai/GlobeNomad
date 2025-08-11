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

  // Initialize token from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Query user data when token exists
  const { data, loading, error } = useQuery(GET_ME, {
    skip: !token,
    errorPolicy: "all",
  });

  // Update authentication status based on query result
  useEffect(() => {
    if (error && token) {
      // Token is invalid, remove it
      logout();
    } else if (data?.me && token) {
      setIsAuthenticated(true);
    }
  }, [data, error, token]);

  const login = (newToken: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", newToken);
    }
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setToken(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    user: data?.me || null,
    loading: loading && !!token,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
