"use client";
import { motion, useTransform, useScroll } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export const PinContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-300, 0]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
};

export const Pin = ({
  children,
  className,
  title,
  href,
  image,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  href?: string;
  image?: string;
}) => {
  const Component = href ? "a" : "div";
  
  return (
    <Component
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-black/30 cursor-pointer",
        className
      )}
    >
      <div className="relative z-10 p-6">
        {image && (
          <div className="mb-4 overflow-hidden rounded-lg">
            <img
              src={image}
              alt={title || "Image"}
              className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        )}
        {title && (
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors">
            {title}
          </h3>
        )}
        <div className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
          {children}
        </div>
      </div>
      
      {/* 3D effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-0 bg-gradient-to-tl from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Component>
  );
};
