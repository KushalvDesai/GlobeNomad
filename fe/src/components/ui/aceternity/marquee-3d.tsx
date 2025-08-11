"use client";
import { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CityItem {
  name: string;
  image: string;
}

export function Marquee3D({
  items,
  className,
  speed = 40,
}: {
  items: CityItem[];
  className?: string;
  speed?: number; // px per second
}) {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: false, margin: "0px" });

  useEffect(() => {
    if (!inView) {
      controls.stop();
      return;
    }
    const distance = 1000; // arbitrary long loop
    const duration = distance / speed;
    controls.start({
      x: [0, -distance],
      transition: { repeat: Infinity, ease: "linear", duration },
    });
  }, [controls, inView, speed]);

  const doubled = [...items, ...items];

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      <motion.div animate={controls} className="flex gap-4 will-change-transform">
        {doubled.map((item, idx) => (
          <div
            key={`${item.name}-${idx}`}
            className="relative w-[260px] h-[160px] flex-shrink-0 perspective-1000"
          >
            <div className="relative w-full h-full rounded-xl overflow-hidden border border-[#2a2a35] bg-[#0f0f17] [transform:rotateY(-8deg)_translateZ(0)] hover:[transform:rotateY(-2deg)_translateZ(0)] transition-transform duration-300">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-95" />
              <div className="absolute inset-x-0 top-0 p-2">
                <span className="px-2 py-1 text-sm font-extrabold text-black bg-white/90 rounded-md shadow">
                  {item.name}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
