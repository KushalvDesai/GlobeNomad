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
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to GlobeNomad
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your ultimate travel companion for discovering amazing destinations
            around the world.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Get Started
            </h2>
            <p className="text-blue-700 mb-4">
              Sign in or create an account to start planning your next
              adventure!
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Discover Destinations
            </h3>
            <p className="text-gray-600">
              Explore amazing places around the world with detailed guides and
              recommendations.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Plan Your Trip
            </h3>
            <p className="text-gray-600">
              Create personalized itineraries and keep track of your travel
              plans.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Share Experiences
            </h3>
            <p className="text-gray-600">
              Connect with fellow travelers and share your amazing journey
              stories.
            </p>
          </div>
        </div>
      </main>
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
