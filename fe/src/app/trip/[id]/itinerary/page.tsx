"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Settings, User, LogOut } from "lucide-react";
import { useMutation } from "@apollo/client";
import { CREATE_ITINERARY } from "@/graphql/mutations";

type Section = {
  id: string;
  title: string;
  notes: string;
  startDate: string;
  endDate: string;
  budget: string;
};

export default function BuildItineraryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([
    { id: crypto.randomUUID(), title: "Section 1", notes: "", startDate: "", endDate: "", budget: "" },
    { id: crypto.randomUUID(), title: "Section 2", notes: "", startDate: "", endDate: "", budget: "" },
    { id: crypto.randomUUID(), title: "Section 3", notes: "", startDate: "", endDate: "", budget: "" },
  ]);

  const itemsInput = useMemo(() =>
    sections.map((s, idx) => ({
      day: idx + 1,
      order: 0,
      stop: {
        name: s.title || `Section ${idx + 1}`,
        description: s.notes || undefined,
        type: "activity",
      },
      // startTime/endTime optional – could be sourced from date fields later
      notes: s.notes || undefined,
    })),
  [sections]);

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
          <div className="flex justify-end">
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
          {sections.map((s, idx) => (
            <section key={s.id} className="rounded-2xl border border-[#2a2a35] bg-[#0f0f17] p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base sm:text-lg font-medium">Section {idx + 1}</h2>
              </div>
              <p className="text-sm text-[#9AA0A6] mb-4">
                All the necessary information about this section. This can be anything like travel
                section, hotel or any other activity.
              </p>
              <textarea
                value={s.notes}
                onChange={(e) =>
                  setSections((arr) => arr.map((x) => (x.id === s.id ? { ...x, notes: e.target.value } : x)))
                }
                placeholder="Notes, details, tickets, etc."
                className="w-full min-h-24 rounded-md bg-[#0b0b12] border border-[#2a2a35] p-3 mb-4"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={s.startDate}
                  onChange={(e) =>
                    setSections((arr) => arr.map((x) => (x.id === s.id ? { ...x, startDate: e.target.value } : x)))
                  }
                  placeholder="Date Range: xxx to yyy"
                  className="w-full rounded-md bg-[#0b0b12] border border-[#2a2a35] p-2"
                />
                <input
                  type="text"
                  value={s.budget}
                  onChange={(e) =>
                    setSections((arr) => arr.map((x) => (x.id === s.id ? { ...x, budget: e.target.value } : x)))
                  }
                  placeholder="Budget of this section"
                  className="w-full rounded-md bg-[#0b0b12] border border-[#2a2a35] p-2"
                />
              </div>
            </section>
          ))}

          <div className="flex justify-center pt-2">
            <button
              onClick={() =>
                setSections((arr) => [
                  ...arr,
                  { id: crypto.randomUUID(), title: `Section ${arr.length + 1}`, notes: "", startDate: "", endDate: "", budget: "" },
                ])
              }
              className="px-4 py-2 rounded-md border border-[#2a2a35] bg-[#0f0f17] hover:bg-[#14141c]"
            >
              + Add another Section
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}


