"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to GlobeNomad</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">🎉 You have logged in successfully! 🎉</h2>
            <p className="text-gray-400 text-lg">
              Welcome to your personal travel dashboard
            </p>
          </div>

          {user && (
            <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4">User Information</h3>
              <div className="space-y-2 text-left">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Name</label>
                  <p className="text-white">{user.name}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Email</label>
                  <p className="text-white">{user.email}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">First Name</label>
                  <p className="text-white">{user.firstName}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Last Name</label>
                  <p className="text-white">{user.lastName}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <p className="text-gray-500 text-sm">
              The proper dashboard will be implemented later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}
