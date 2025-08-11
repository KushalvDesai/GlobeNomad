"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ItineraryLanding() {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    const id = params.get("id");
    if (id) router.replace(`/trip/${id}/itinerary`);
  }, [params, router]);
  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB] p-8">
      <div className="max-w-3xl mx-auto">Creating trip…</div>
    </div>
  );
}


