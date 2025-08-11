"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  href,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
}) => {
  const Component = href ? "a" : "div";
  
  return (
    <Component
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-black/30",
        className
      )}
    >
      <div className="relative z-10 p-6">
        {header && (
          <div className="mb-4">
            {header}
          </div>
        )}
        {icon && (
          <div className="mb-4 text-white/80 group-hover:text-white transition-colors">
            {icon}
          </div>
        )}
        {title && (
          <div className="mb-2 font-semibold text-white group-hover:text-white transition-colors">
            {title}
          </div>
        )}
        {description && (
          <div className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
            {description}
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Component>
  );
};
