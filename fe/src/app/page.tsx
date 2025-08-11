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
