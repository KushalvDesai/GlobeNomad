"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Users, 
  Plus,
  User,
  Settings,
  LogOut,
  ChevronDown
} from "lucide-react";
import { ThreeDMarquee } from "./components/ThreeDMarquee";
import { Header } from "./components/Header";

export default function Home() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();

  // Cities data
  const cities = [
    { name: "Agra", src: "assets/cities/agra.jpg" },
    { name: "Bengaluru", src: "assets/cities/bengaluru.webp" },
    { name: "Delhi", src: "assets/cities/delhi.jpg" },
    { name: "Hyderabad", src: "assets/cities/hyderabad.jfif" },
    { name: "Jaipur", src: "assets/cities/jaipur.jfif" },
    { name: "Kolkata", src: "assets/cities/kolkata.jfif" },
    { name: "Mumbai", src: "assets/cities/mumbai.jpg" },
    { name: "Pune", src: "assets/cities/pune.jfif" },
    { name: "Ahmedabad", src: "assets/cities/ahmedabad.webp" },
    { name: "Chennai", src: "assets/cities/chennai.jpg" },
    { name: "Chandigarh", src: "assets/cities/chandigarh.webp" },
    { name: "Lucknow", src: "assets/cities/lucknow.jfif" },
    { name: "Bhopal", src: "assets/cities/bhopal.jfif" },
    { name: "Indore", src: "assets/cities/indore.jpg" }
  ];

  // Repeat to fill the 3D grid nicely
  const repeatedCities = Array.from({ length: 2 }, () => cities).flat();
  const cityImages = repeatedCities.map((c) => c.src);

  // Event handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Search:", e.target.value);
  };

  const handleGroupBy = () => {
    console.log("Group by clicked");
  };

  const handleFilter = () => {
    console.log("Filter clicked");
  };

  const handleSort = () => {
    console.log("Sort clicked");
  };

  const handlePlanTrip = () => {
    console.log("Plan a trip clicked");
    router.push("/planTrip");
  };

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB]">
      <Header />

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* 3D Marquee Banner */}
          <section className="-mx-6 md:mx-0">
            <div className="rounded-3xl bg-gray-950/5 ring-1 ring-neutral-700/10 dark:bg-neutral-800 overflow-hidden">
              <ThreeDMarquee images={cityImages} className="h-[400px] w-full" />
            </div>
          </section>

          {/* Search and Controls */}
          <section>
            <div className="flex flex-col md:flex-row items-stretch gap-4">
              
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA0A6] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search destinations, activities, or trips..."
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-3 rounded-md bg-[#0f0f17] border border-[#2a2a35] text-[#E6E8EB] placeholder-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-[#27C3FF]"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex gap-3 shrink-0">
                <button 
                  onClick={handleGroupBy}
                  className="px-4 py-3 rounded-md bg-[#15151f] border border-[#2a2a35] text-[#E6E8EB] hover:bg-[#1a1a26] flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Group by</span>
                </button>
                
                <button 
                  onClick={handleFilter}
                  className="px-4 py-3 rounded-md bg-[#15151f] border border-[#2a2a35] text-[#E6E8EB] hover:bg-[#1a1a26] flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                
                <button 
                  onClick={handleSort}
                  className="px-4 py-3 rounded-md bg-[#15151f] border border-[#2a2a35] text-[#E6E8EB] hover:bg-[#1a1a26] flex items-center gap-2"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Sort by</span>
                </button>
              </div>
            </div>
          </section>

          {/* Content Sections */}
          <section className="grid md:grid-cols-2 gap-8">
            
            {/* Top Regional Selections */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Top Regional Selections</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {cities.slice(0, 6).map((city, index) => (
                  <div key={index} className="relative group cursor-pointer">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#15151f] border border-[#2a2a35] hover:border-[#27C3FF] transition-all">
                      <img 
                        src={city.src} 
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-1 text-sm font-semibold text-white bg-[#0b0b12]/60 backdrop-blur-sm rounded">
                          {city.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Previous Trips */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Previous Trips</h2>
              <div className="space-y-3">
                {[
                  { title: "Golden Triangle Tour", date: "Dec 2024", cities: "Delhi • Agra • Jaipur" },
                  { title: "South India Adventure", date: "Nov 2024", cities: "Chennai • Bengaluru • Hyderabad" },
                  { title: "Western Coast Journey", date: "Oct 2024", cities: "Mumbai • Pune • Ahmedabad" }
                ].map((trip, index) => (
                  <div key={index} className="p-4 rounded-xl bg-[#15151f] border border-[#2a2a35] hover:bg-[#1a1a26] hover:border-[#27C3FF] transition-all cursor-pointer">
                    <h3 className="font-semibold text-white">{trip.title}</h3>
                    <p className="text-[#9AA0A6] text-sm">{trip.date}</p>
                    <p className="text-[#E6E8EB] text-sm">{trip.cities}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Floating Plan a Trip Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 right-6 z-20"
      >
        <button onClick={handlePlanTrip} className="px-5 py-3 rounded-full text-white shadow-lg hover:brightness-110 flex items-center gap-2 bg-[#c7a14a] bg-gradient-to-r from-[#c7a14a] to-[#8b6e3c]">
          <Plus className="w-5 h-5" />
          <span>Plan a trip</span>
        </button>
      </motion.div>
    </div>
  );
}
