"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Settings, User, LogOut, Trash2, GripVertical, Plus } from "lucide-react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_ITINERARY } from "@/graphql/mutations";
import { GET_TRIP, GET_CITIES } from "@/graphql/queries";
import Fuse from "fuse.js";

type StopDraft = {
  id: string;
  city: string;
  title: string;
  notes: string;
  date: string;
  activity: string;
  budget: string;
};

export default function BuildItineraryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: tripData } = useQuery(GET_TRIP, { variables: { id: params.id } });
  const trip = tripData?.trip as { id: string; title: string; startDate?: string; endDate?: string } | undefined;

  // Cities for improved search
  const { data: citiesData } = useQuery<{ getCities: string[] }>(GET_CITIES);
  const cityOptions = citiesData?.getCities ?? [];
  const fuse = useMemo(() => new Fuse(cityOptions, { includeScore: true, threshold: 0.35 }), [cityOptions]);
  const [activeCityIndex, setActiveCityIndex] = useState<number>(-1);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);

  const [stops, setStops] = useState<StopDraft[]>([
    { id: crypto.randomUUID(), city: "", title: "", notes: "", date: "", activity: "", budget: "" },
  ]);

  const itemsInput = useMemo(() =>
    stops.map((s, idx) => ({
      day: idx + 1,
      order: 0,
      stop: {
        name: s.title || s.activity || `Stop ${idx + 1}`,
        city: s.city || undefined,
        description: s.notes || undefined,
        type: s.activity ? "activity" : "destination",
      },
      notes: s.notes || undefined,
    })),
  [stops]);

  const [createItinerary, { loading: saving }] = useMutation(CREATE_ITINERARY);

  const handleLogout = () => {
    localStorage.removeItem("gn_token");
    document.cookie = "gn_token=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB]">
      <header className="px-6 py-4 border-b border-[#2a2a35] sticky top-0 z-30 bg-[#0b0b12]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-2xl font-semibold text-white hover:opacity-90">
            GlobeNomad
          </button>
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

      <main className="px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{trip?.title ?? "Build Itinerary"}</h1>
              {trip?.startDate && trip?.endDate && (
                <p className="text-sm text-[#9AA0A6]">{new Date(trip.startDate).toDateString()} - {new Date(trip.endDate).toDateString()}</p>
              )}
            </div>
            <button
              onClick={async () => {
                try {
                  await createItinerary({
                    variables: {
                      createItineraryInput: {
                        tripId: params.id,
                        items: itemsInput,
                        notes: "",
                      },
                    },
                  });
                } catch (e) {
                  console.error(e);
                }
              }}
              className="px-4 py-2 rounded-md bg-[#c7a14a] text-white disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Itinerary"}
            </button>
          </div>
          {stops.map((s, idx) => (
            <section key={s.id} className="rounded-2xl border border-[#2a2a35] bg-[#0f0f17] p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-[#9AA0A6]" />
                  <h2 className="text-base sm:text-lg font-medium">Stop {idx + 1}</h2>
                </div>
                <button
                  onClick={() => setStops((arr) => arr.filter((x) => x.id !== s.id))}
                  className="text-red-400 hover:text-red-300"
                  aria-label="Delete stop"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="relative">
                  <input
                    type="text"
                    value={s.city}
                    onFocus={() => {
                      setActiveStopId(s.id);
                      setActiveCityIndex(-1);
                    }}
                    onBlur={() => setTimeout(() => setActiveStopId((id) => (id === s.id ? null : id)), 120)}
                    onChange={(e) => setStops((arr) => arr.map((x) => (x.id === s.id ? { ...x, city: e.target.value } : x)))}
                    onKeyDown={(e) => {
                      const suggestions = s.city.trim() ? fuse.search(s.city.trim()).map((r) => r.item).slice(0, 8) : [];
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setActiveCityIndex((prev) => (prev + 1) % Math.max(1, suggestions.length));
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setActiveCityIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
                      } else if (e.key === "Enter" && activeCityIndex >= 0 && suggestions.length > 0) {
                        e.preventDefault();
                        const choice = suggestions[activeCityIndex];
                        setStops((arr) => arr.map((x) => (x.id === s.id ? { ...x, city: choice } : x)));
                        setActiveStopId(null);
                      }
                    }}
                    placeholder="City"
                    className="w-full rounded-md bg-[#0b0b12] border border-[#2a2a35] p-2"
                  />
                  {activeStopId === s.id && s.city.trim().length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 rounded-md border border-[#2a2a35] bg-[#0f0f17] shadow-xl z-10 max-h-72 overflow-auto">
                      {(s.city.trim() ? fuse.search(s.city.trim()).map((r) => r.item).slice(0, 8) : []).map((city, i) => (
                        <button
                          key={city}
                          onMouseDown={() => {
                            setStops((arr) => arr.map((x) => (x.id === s.id ? { ...x, city } : x)));
                            setActiveStopId(null);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-[#14141c] ${i === activeCityIndex ? "bg-[#14141c]" : ""}`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="date"
                  value={s.date}
                  onChange={(e) => setStops((arr) => arr.map((x) => (x.id === s.id ? { ...x, date: e.target.value } : x)))}
                  min={trip?.startDate ? new Date(trip.startDate).toISOString().slice(0,10) : undefined}
                  max={trip?.endDate ? new Date(trip.endDate).toISOString().slice(0,10) : undefined}
                  className="w-full rounded-md bg-[#0b0b12] border border-[#2a2a35] p-2"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={s.activity}
                  onChange={(e) => setStops((arr) => arr.map((x) => (x.id === s.id ? { ...x, activity: e.target.value } : x)))}
                  placeholder="Activity / Place"
                  className="w-full rounded-md bg-[#0b0b12] border border-[#2a2a35] p-2"
                />
                <input
                  type="text"
                  value={s.budget}
                  onChange={(e) => setStops((arr) => arr.map((x) => (x.id === s.id ? { ...x, budget: e.target.value } : x)))}
                  placeholder="Budget"
                  className="w-full rounded-md bg-[#0b0b12] border border-[#2a2a35] p-2"
                />
              </div>
              <textarea
                value={s.notes}
                onChange={(e) => setStops((arr) => arr.map((x) => (x.id === s.id ? { ...x, notes: e.target.value } : x)))}
                placeholder="Notes, details, tickets, etc."
                className="w-full min-h-24 rounded-md bg-[#0b0b12] border border-[#2a2a35] p-3 mt-3"
              />
            </section>
          ))}

          <div className="flex justify-center pt-2">
            <button onClick={() => setStops((arr) => [...arr, { id: crypto.randomUUID(), city: "", title: "", notes: "", date: "", activity: "", budget: "" }])} className="px-4 py-2 rounded-md border border-[#2a2a35] bg-[#0f0f17] hover:bg-[#14141c]">
              <span className="inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Stop</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}


