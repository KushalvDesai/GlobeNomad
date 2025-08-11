"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { GlobeConfig } from "./Globe";

// Dynamic import to prevent SSR issues
const World = dynamic(
  () => import("./Globe").then((mod) => mod.World),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/60">Loading globe...</div>
      </div>
    ),
  }
);

interface GlobeWrapperProps {
  globeConfig: GlobeConfig;
  data: Array<{
    order: number;
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    arcAlt: number;
    color: string;
  }>;
}

export function GlobeWrapper({ globeConfig, data }: GlobeWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/60">Loading globe...</div>
      </div>
    );
  }

  return <World globeConfig={globeConfig} data={data} />;
}
