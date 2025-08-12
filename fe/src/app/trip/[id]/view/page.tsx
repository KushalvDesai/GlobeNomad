"use client";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_ITINERARY } from "@/graphql/queries";
import { useState } from "react";
import { Settings, User, LogOut } from "lucide-react";

export default function ViewItineraryDashboard() {
  const router = useRouter();
  const { id } = useParams();
  const { data, loading, error } = useQuery(GET_ITINERARY, { variables: { tripId: id } });
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState("day");
  const [sortBy, setSortBy] = useState("order");
  const [filter, setFilter] = useState("");

  if (loading) return <div className="p-8">Loading itinerary...</div>;
  if (error || !data?.getItinerary) return <div className="p-8 text-red-500">Itinerary not found.</div>;

  const itinerary = data.getItinerary;
  let stops: any[] = itinerary.items || [];
  if (search.trim()) {
    stops = stops.filter((s) =>
      (s.name || s.activity || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.city || "").toLowerCase().includes(search.toLowerCase())
    );
  }

  // Group stops by day and city
  const byDay: Record<string, any[]> = stops.reduce((acc: Record<string, any[]>, stop: any) => {
    const day = stop.startDate || "Unscheduled";
    if (!acc[day]) acc[day] = [];
    acc[day].push(stop);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB]">
      {/* Static Navbar */}
      <header className="px-6 py-4 border-b border-[#2a2a35] sticky top-0 z-30 bg-[#0b0b12]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-2xl font-semibold text-white hover:opacity-90">
            GlobeNomad
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-md hover:bg-[#14141c]" aria-label="Settings">
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={() => router.push("/profile")}
              className="p-2 rounded-md hover:bg-[#14141c]" 
              aria-label="Profile"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("gn_token");
                document.cookie = "gn_token=; path=/; max-age=0";
                router.push("/login");
              }}
              className="p-2 rounded-md hover:bg-[#14141c] text-red-400 hover:text-red-300"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-5xl mx-auto p-8">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Itinerary for a selected place</h1>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder="Search bar ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="rounded border border-[#2a2a35] bg-[#14141c] px-3 py-2 text-sm text-white"
            />
            <button className="rounded border border-[#2a2a35] bg-[#14141c] px-3 py-2 text-sm">Group by</button>
            <button className="rounded border border-[#2a2a35] bg-[#14141c] px-3 py-2 text-sm">Filter</button>
            <button className="rounded border border-[#2a2a35] bg-[#14141c] px-3 py-2 text-sm">Sort by...</button>
          </div>
        </div>
        {/* Table Header */}
        <div className="flex font-semibold text-lg border-b border-[#2a2a35] pb-2 mb-4">
          <div className="w-32">&nbsp;</div>
          <div className="flex-1 text-center">Physical Activity</div>
          <div className="w-40 text-center">Expense</div>
        </div>
        {/* Day-wise layout */}
        {Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0])).map(([day, stops], dayIdx) => (
          <div key={day} className="mb-8">
            <div className="flex items-center mb-2">
              <div className="w-32 flex items-center">
                <span className="bg-[#14141c] px-3 py-1 rounded text-sm font-semibold">Day {dayIdx + 1}</span>
              </div>
              <div className="flex-1 border-t border-dashed border-[#2a2a35] mx-2" />
            </div>
            {stops.map((stop, i) => (
              <div key={stop.id} className="flex items-center mb-2">
                <div className="w-32 text-right pr-4">{i === 0 ? null : <span className="text-[#9AA0A6]">↓</span>}</div>
                {/* Read-only Activity */}
                <div className="flex-1 px-3 py-2">
                  {stop.name || stop.activity || <span className="text-[#666]">(No activity)</span>}
                </div>
                {/* Read-only Expense */}
                <div className="w-40 text-center px-3 py-2">
                  {stop.budget ? `₹${stop.budget}` : <span className="text-[#666]">(No expense)</span>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
