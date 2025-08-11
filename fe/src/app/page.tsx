"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { ThreeDMarquee, type ThreeDMarqueeItem } from "@/components/ui/aceternity/three-d-marquee";
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Users, 
  Plus,
  User,
  Settings
} from "lucide-react";

function Dashboard() {
  const { user, logout } = useAuth();

  // Cities with placeholder images - these can be replaced with actual images later
  const cities = [
    { name: "Agra", src: "/next.svg" }, // Placeholder
    { name: "Bengaluru", src: "/next.svg" }, // Placeholder
    { name: "Delhi", src: "/next.svg" }, // Placeholder
    { name: "Hyderabad", src: "/next.svg" }, // Placeholder
    { name: "Jaipur", src: "/next.svg" }, // Placeholder
    { name: "Kolkata", src: "/next.svg" }, // Placeholder
    { name: "Mumbai", src: "/next.svg" }, // Placeholder
    { name: "Pune", src: "/next.svg" }, // Placeholder
    { name: "Ahmedabad", src: "/next.svg" }, // Placeholder
    { name: "Chennai", src: "/next.svg" }, // Placeholder
    { name: "Chandigarh", src: "/next.svg" }, // Placeholder
    { name: "Lucknow", src: "/next.svg" }, // Placeholder
    { name: "Bhopal", src: "/next.svg" }, // Placeholder
    { name: "Indore", src: "/next.svg" } // Placeholder
  ];

  // Repeat to fill the 3D grid nicely
  const repeatedCities = Array.from({ length: 2 }, () => cities).flat();

  const marqueeData: ThreeDMarqueeItem[] = repeatedCities.map((c) => ({
    src: c.src,
    name: c.name,
  }));

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB]">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[#2a2a35] sticky top-0 z-30 bg-[#0b0b12]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-sm text-[#9AA0A6]">Main Landing Page (Screen 3)</div>
          <h1 className="text-2xl font-semibold text-white">GlobeNormad</h1>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-md hover:bg-[#14141c]" aria-label="Settings">
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={logout}
              className="p-2 rounded-md hover:bg-[#14141c]" 
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Banner replaced with 3D Marquee: edge-to-edge to match navbar width */}
          <section className="-mx-6 md:mx-0">
            <div className="rounded-3xl bg-gray-950/5 ring-1 ring-neutral-700/10 dark:bg-neutral-800 overflow-hidden">
              <ThreeDMarquee items={marqueeData} className="h-[560px] w-full" />
            </div>
          </section>

          {/* Search and Controls */}
          <section>
            <div className="flex flex-col md:flex-row items-stretch gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA0A6] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search destinations, activities, or trips..."
                  className="w-full pl-10 pr-4 py-3 rounded-md bg-[#0f0f17] border border-[#2a2a35] text-[#E6E8EB] placeholder-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-[#27C3FF]"
                />
              </div>
              <div className="flex gap-3 shrink-0">
                <button className="px-4 py-3 rounded-md bg-[#15151f] border border-[#2a2a35] text-[#E6E8EB] hover:bg-[#1a1a26] flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Group by</span>
                </button>
                <button className="px-4 py-3 rounded-md bg-[#15151f] border border-[#2a2a35] text-[#E6E8EB] hover:bg-[#1a1a26] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                <button className="px-4 py-3 rounded-md bg-[#15151f] border border-[#2a2a35] text-[#E6E8EB] hover:bg-[#1a1a26] flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Sort by</span>
                </button>
              </div>
            </div>
          </section>

          {/* User Information Section */}
          {user && (
            <section className="bg-[#12121a] border border-[#2a2a35] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Welcome back, {user.firstName}!</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0f0f17] p-4 rounded-lg">
                  <label className="block text-[#9AA0A6] text-sm mb-1">Name</label>
                  <p className="text-[#E6E8EB]">{user.name}</p>
                </div>
                <div className="bg-[#0f0f17] p-4 rounded-lg">
                  <label className="block text-[#9AA0A6] text-sm mb-1">Email</label>
                  <p className="text-[#E6E8EB]">{user.email}</p>
                </div>
                <div className="bg-[#0f0f17] p-4 rounded-lg">
                  <label className="block text-[#9AA0A6] text-sm mb-1">First Name</label>
                  <p className="text-[#E6E8EB]">{user.firstName}</p>
                </div>
                <div className="bg-[#0f0f17] p-4 rounded-lg">
                  <label className="block text-[#9AA0A6] text-sm mb-1">Last Name</label>
                  <p className="text-[#E6E8EB]">{user.lastName}</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 right-6 z-20"
      >
        <button className="px-5 py-3 rounded-full text-white shadow-lg hover:brightness-110 flex items-center gap-2"
          style={{ background: "linear-gradient(90deg, var(--accent-1), var(--accent-2))" }}>
          <Plus className="w-5 h-5" />
          <span>Plan a trip</span>
        </button>
      </motion.div>
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
