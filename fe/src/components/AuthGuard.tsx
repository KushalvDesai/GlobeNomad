"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
}) => {
  const { isAuthenticated, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated && !error) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, error, router]);

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen bg-[#0b0b12] flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-xl mb-4">Loading...</div>
            <div className="text-gray-400 text-sm">Checking authentication status</div>
          </div>
        </div>
      )
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0b12] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-400 text-xl mb-4">Connection Error</div>
          <div className="text-gray-300 text-sm mb-6">{error}</div>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Retry Connection
            </button>
            <button 
              onClick={() => router.push("/login")} 
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0b12] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Redirecting to login...</div>
          <div className="text-gray-400 text-sm">Please wait</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
