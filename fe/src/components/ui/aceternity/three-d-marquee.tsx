"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export interface ThreeDMarqueeItem {
  src: string;
  name: string;
}

interface ThreeDMarqueeProps {
  items: ThreeDMarqueeItem[];
  className?: string;
}

export function ThreeDMarquee({ items, className }: ThreeDMarqueeProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 z-10 pointer-events-none" />
      
      <motion.div
        className="flex space-x-4 h-full"
        animate={{
          x: ["0%", "-50%"],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          },
        }}
      >
        {/* Render items twice for seamless loop */}
        {[...items, ...items].map((item, index) => (
          <motion.div
            key={`${item.name}-${index}`}
            className="flex-shrink-0 relative w-80 h-full rounded-xl overflow-hidden cursor-pointer"
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            style={{ perspective: "1000px" }}
          >
            <Image
              src={item.src}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <motion.div
              className="absolute bottom-4 left-4 text-white text-xl font-semibold"
              animate={{
                opacity: hoveredIndex === index ? 1 : 0.8,
                y: hoveredIndex === index ? -4 : 0,
              }}
            >
              {item.name}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
