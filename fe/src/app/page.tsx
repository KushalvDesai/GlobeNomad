"use client";
import { motion } from "framer-motion";
import { ThreeDMarquee, type ThreeDMarqueeItem } from "@/app/components/3d-marquee";
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Users, 
  Plus,
  User,
  Settings
} from "lucide-react";

export default function Home() {
  
  // Cities with local assets in public/assets/cities (filenames and case must match exactly)
  const cities = [
    { name: "Agra", src: "/assets/cities/agra.jpg" },
    { name: "Ahmedabad", src: "/assets/cities/ahmedabad.webp" },
    { name: "Bengaluru", src: "/assets/cities/bengaluru.webp" },
    { name: "Bhopal", src: "/assets/cities/bhopal.jfif" },
    { name: "Chandigarh", src: "/assets/cities/chandigarh.webp" },
    { name: "Chennai", src: "/assets/cities/chennai.jpg" },
    { name: "Delhi", src: "/assets/cities/delhi.jpg" },
    { name: "Hyderabad", src: "/assets/cities/hyderabad.jfif" },
    { name: "Indore", src: "/assets/cities/indore.jpg" },
    { name: "Jaipur", src: "/assets/cities/jaipur.jfif" },
    { name: "Kolkata", src: "/assets/cities/kolkata.jfif" },
    { name: "Lucknow", src: "/assets/cities/lucknow.jfif" },
    { name: "Mumbai", src: "/assets/cities/mumbai.jpg" },
    { name: "Pune", src: "/assets/cities/pune.jfif" },
    { name: "Surat", src: "/assets/cities/surat.jpeg" },
    { name: "Vadodara", src: "/assets/cities/vadodara.avif" },
    { name: "Sikkim", src: "/assets/cities/sikkim.jpeg" }
  ];

  // Repeat to fill the 3D grid nicely
  const repeatedCities = Array.from({ length: 2 }, () => cities).flat();

  const items: ThreeDMarqueeItem[] = repeatedCities.map((c) => ({ src: c.src, name: c.name }));

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB]">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[#2a2a35] sticky top-0 z-30 bg-[#0b0b12]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-white">GlobeNomad</h1>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-md hover:bg-[#14141c]" aria-label="Settings">
              <Settings className="w-5 h-5" />
            </button>
            <a href="/admin/login" className="p-2 rounded-md hover:bg-[#14141c]" aria-label="Account">
              <User className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Banner with 3D Marquee centered */}
          <section>
            <div className="rounded-3xl bg-gray-950/5 ring-1 ring-neutral-700/10 dark:bg-neutral-800 overflow-hidden">
              <ThreeDMarquee items={items} />
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
        </div>
      </main>

      {/* Floating Action Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 right-6 z-20"
      >
        <button className="px-5 py-3 rounded-full text-white shadow-lg hover:brightness-110 flex items-center gap-2 bg-[#c7a14a] bg-gradient-to-r from-[#c7a14a] to-[#8b6e3c]">
          <Plus className="w-5 h-5" />
          <span>Plan a trip</span>
        </button>
      </motion.div>
    </div>
  );
}