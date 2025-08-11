"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, MapPin, Settings, User, LogOut } from "lucide-react";
import { useMutation, useQuery } from "@apollo/client";
import { GET_CITIES } from "@/graphql/queries";
import { CREATE_TRIP } from "@/graphql/mutations";
import Fuse from "fuse.js";

export default function NewTripPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [activeCityIndex, setActiveCityIndex] = useState(-1);
  const { data } = useQuery<{ getCities: string[] }>(GET_CITIES);
  const cityOptions = data?.getCities ?? [];
  const fuse = useMemo(() => new Fuse(cityOptions, { includeScore: true, threshold: 0.35 }), [cityOptions]);
  const citySuggestions = useMemo(() => {
    const q = destination.trim();
    if (!q) return [] as string[];
    return fuse.search(q).map((r) => r.item).slice(0, 8);
  }, [destination, fuse]);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const iso = d.toISOString().slice(0, 10);
    return iso;
  }, []);

  useEffect(() => {
    const dest = searchParams.get("destination");
    if (dest) setDestination(dest);
  }, [searchParams]);

  const canSubmit = useMemo(() => {
    if (!destination || !startDate || !endDate) return false;
    return new Date(startDate) <= new Date(endDate);
  }, [destination, startDate, endDate]);

  const suggestedPlaces = [
    { name: "Agra", src: "/assets/cities/agra.jpg" },
    { name: "Bengaluru", src: "/assets/cities/bengaluru.webp" },
    { name: "Chennai", src: "/assets/cities/chennai.jpg" },
    { name: "Delhi", src: "/assets/cities/delhi.jpg" },
    { name: "Mumbai", src: "/assets/cities/mumbai.jpg" },
    { name: "Sikkim", src: "/assets/cities/sikkim.jpeg" },
  ];

  const [createTrip, { loading: creating }] = useMutation(CREATE_TRIP, {
    onCompleted: (res: any) => {
      const id: string | undefined = res?.createTrip?.id;
      if (id) {
        router.push(`/trip/${id}/itinerary`);
      }
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("gn_token");
    document.cookie = "gn_token=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB]">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[#2a2a35] sticky top-0 z-30 bg-[#0b0b12]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="text-white text-2xl font-semibold hover:opacity-90"
            >
              GlobeNomad
            </button>
            <span className="text-sm text-[#9AA0A6] hidden sm:inline">Create a new trip</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-md hover:bg-[#14141c]" aria-label="Settings">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-md hover:bg-[#14141c]" aria-label="Account">
              <User className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-md hover:bg-[#14141c] text-red-400 hover:text-red-300" 
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <section>
            <h2 className="text-lg font-medium mb-3">Plan a new trip</h2>
            <div className="rounded-2xl border border-[#2a2a35] bg-[#0f0f17] p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-[#9AA0A6]">Select a place</span>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA0A6]" />
                    <input
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="City or destination"
                      onFocus={() => setShowCitySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
                      onKeyDown={(e) => {
                        if (!showCitySuggestions && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                          setShowCitySuggestions(true);
                          return;
                        }
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setActiveCityIndex((prev) => {
                            const next = prev + 1;
                            return next >= citySuggestions.length ? 0 : next;
                          });
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setActiveCityIndex((prev) => {
                            const next = prev - 1;
                            return next < 0 ? citySuggestions.length - 1 : next;
                          });
                        } else if (e.key === "Enter") {
                          if (activeCityIndex >= 0 && activeCityIndex < citySuggestions.length) {
                            e.preventDefault();
                            setDestination(citySuggestions[activeCityIndex]);
                            setShowCitySuggestions(false);
                          }
                        } else if (e.key === "Escape") {
                          setShowCitySuggestions(false);
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2 rounded-md bg-[#0b0b12] border border-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-[#27C3FF]"
                    />
                    {showCitySuggestions && destination.trim().length > 0 && (
                      <div className="absolute left-0 right-0 mt-2 rounded-md border border-[#2a2a35] bg-[#0f0f17] shadow-xl z-10 max-h-72 overflow-auto">
                        {citySuggestions.length > 0 ? (
                          citySuggestions.map((city, idx) => (
                            <button
                              key={city}
                              onMouseDown={() => {
                                setDestination(city);
                                setShowCitySuggestions(false);
                              }}
                              className={`w-full text-left px-3 py-2 hover:bg-[#14141c] ${idx === activeCityIndex ? "bg-[#14141c]" : ""}`}
                            >
                              {city}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-[#9AA0A6]">No matches</div>
                        )}
                      </div>
                    )}
                  </div>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm text-[#9AA0A6]">Start date</span>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" color="#9AA0A6" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={today}
                      className="w-full pl-9 pr-3 py-2 rounded-md bg-[#0b0b12] border border-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-[#27C3FF]"
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm text-[#9AA0A6]">End date</span>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" color="#9AA0A6" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || today}
                      className="w-full pl-9 pr-3 py-2 rounded-md bg-[#0b0b12] border border-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-[#27C3FF]"
                    />
                  </div>
                </label>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  disabled={!canSubmit || creating}
                  onClick={async () => {
                    try {
                      await createTrip({
                        variables: {
                          input: {
                            title: destination,
                            startDate: startDate || undefined,
                            endDate: endDate || undefined,
                          },
                        },
                      });
                    } catch (err: any) {
                      const message: string = err?.message || "";
                      if (message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("jwt")) {
                        const returnTo = encodeURIComponent(`/trip/new?destination=${encodeURIComponent(destination)}&start=${startDate}&end=${endDate}`);
                        router.push(`/admin/login?returnTo=${returnTo}`);
                        return;
                      }
                      console.error(err);
                      alert("Failed to create trip. Please try again.");
                    }
                  }}
                  className="px-4 py-2 rounded-md bg-[#c7a14a] disabled:opacity-50 text-white"
                >
                  {creating ? "Creating…" : "Create Trip"}
                </button>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm text-[#9AA0A6] mb-3">Suggestion for Places to Visit/Activities to perform</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedPlaces.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setDestination(p.name)}
                  className="group overflow-hidden rounded-2xl border border-[#2a2a35] bg-[#0f0f17] text-left"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.src}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-[#9AA0A6]">Click to use as destination</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}


