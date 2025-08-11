import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <SignedIn>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to GlobeNomad, {user?.firstName || user?.emailAddresses[0]?.emailAddress}! 🌍
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Your journey begins here. Explore the world with confidence and discover amazing destinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Image
                  src="/globe.svg"
                  alt="Explore icon"
                  width={32}
                  height={32}
                  className="mr-3"
                />
                <h2 className="text-xl font-semibold text-gray-800">Explore Destinations</h2>
              </div>
              <p className="text-gray-600">
                Discover amazing places around the world and plan your next adventure.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Image
                  src="/file.svg"
                  alt="Plan icon"
                  width={32}
                  height={32}
                  className="mr-3"
                />
                <h2 className="text-xl font-semibold text-gray-800">Plan Your Trip</h2>
              </div>
              <p className="text-gray-600">
                Create detailed itineraries and keep track of your travel plans.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Image
                  src="/window.svg"
                  alt="Share icon"
                  width={32}
                  height={32}
                  className="mr-3"
                />
                <h2 className="text-xl font-semibold text-gray-800">Share Experiences</h2>
              </div>
              <p className="text-gray-600">
                Connect with fellow travelers and share your amazing experiences.
              </p>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-2xl font-semibold text-blue-800 mb-3">Ready to start exploring?</h3>
            <p className="text-blue-700 mb-4">
              Begin your journey by exploring our features and planning your next adventure.
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
              Start Exploring
            </button>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <Image
              className="mx-auto mb-8"
              src="/globe.svg"
              alt="GlobeNomad logo"
              width={120}
              height={120}
            />
            <h1 className="text-5xl font-bold text-gray-800 mb-6">
              Welcome to GlobeNomad
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your ultimate travel companion. Plan, explore, and share your adventures with the world.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <p className="text-lg text-yellow-800">
                🔒 Please sign in or sign up to access your personalized travel dashboard.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Join thousands of travelers who trust GlobeNomad for their adventures.
            </div>
          </div>
        </div>
      </SignedOut>
    </div>
  );
}
