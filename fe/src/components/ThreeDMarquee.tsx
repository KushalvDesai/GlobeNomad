"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ThreeDMarqueeItem = { src: string; name?: string };

export function ThreeDMarquee({
  items,
  className,
}: {
  items: ThreeDMarqueeItem[];
  className?: string;
}) {
  const images = items.map((i) => i.src);
  const names = items.map((i) => i.name);
  const FALLBACK_SRC = "/assets/cities/fallback.svg";

  const chunkSize = Math.ceil(images.length / 4);
  const chunks = Array.from({ length: 4 }, (_, colIndex) => {
    const start = colIndex * chunkSize;
    return images.slice(start, start + chunkSize);
  });

  let labelIndex = 0;

  return (
    <div className={cn("mx-auto block h-[600px] w-full overflow-hidden rounded-2xl max-sm:h-100", className)}>
      <div className="flex size-full items-center justify-center">
        {/* match Aceternity UI canvas sizing and scale */}
        <div className="size-[1720px] shrink-0 scale-50 sm:scale-75 lg:scale-100">
          <div
            style={{ transform: "rotateX(55deg) rotateY(0deg) rotateZ(-45deg)" }}
            className="relative top-140 right-[50%] grid size-full origin-top-left grid-cols-4 gap-8"
          >
            {chunks.map((subarray, colIndex) => (
              <motion.div
                key={colIndex + "marquee"}
                animate={{ y: colIndex % 2 === 0 ? 100 : -100 }}
                transition={{ duration: colIndex % 2 === 0 ? 10 : 15, repeat: Infinity, repeatType: "reverse" }}
                className="flex flex-col items-start gap-8"
              >
                <GridLineVertical className="-left-4" offset="50px" />
                {subarray.map((image, imageIndex) => {
                  const name = names[labelIndex++] ?? undefined;
                  return (
                    <div className="relative" key={imageIndex + image}>
                      <GridLineHorizontal className="-top-4" offset="10px" />
                      <div className="relative">
                        <motion.img
                          whileHover={{ y: -10 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          src={image}
                          alt={name || `Image ${imageIndex + 1}`}
                          className="aspect-[970/700] rounded-lg object-cover ring ring-gray-950/5 hover:shadow-2xl"
                          width={1000}
                          height={700}
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            if (!img.src.endsWith("fallback.svg")) {
                              img.onerror = null;
                              img.src = FALLBACK_SRC;
                            }
                          }}
                        />
                        {name && (
                          <div className="absolute inset-x-0 top-0 p-2">
                            <span className="px-2 py-1 text-sm font-extrabold text-black bg-white/90 rounded-md shadow">
                              {name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const GridLineHorizontal = ({ className, offset }: { className?: string; offset?: string }) => {
  return (
    <div
      style={{
        "--background": "#ffffff",
        "--color": "rgba(0, 0, 0, 0.2)",
        "--height": "1px",
        "--width": "5px",
        "--fade-stop": "90%",
        "--offset": offset || "200px",
        "--color-dark": "rgba(255, 255, 255, 0.2)",
        maskComposite: "exclude",
      } as React.CSSProperties}
      className={cn(
        "absolute left-[calc(var(--offset)/2*-1)] h-[var(--height)] w-[calc(100%+var(--offset))]",
        "bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        "dark:bg-[linear-gradient(to_right,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
        className,
      )}
    />
  );
};

const GridLineVertical = ({ className, offset }: { className?: string; offset?: string }) => {
  return (
    <div
      style={{
        "--background": "#ffffff",
        "--color": "rgba(0, 0, 0, 0.2)",
        "--height": "5px",
        "--width": "1px",
        "--fade-stop": "90%",
        "--offset": offset || "150px",
        "--color-dark": "rgba(255, 255, 255, 0.2)",
        maskComposite: "exclude",
      } as React.CSSProperties}
      className={cn(
        "absolute top-[calc(var(--offset)/2*-1)] h-[calc(100%+var(--offset))] w-[var(--width)]",
        "bg-[linear-gradient(to_bottom,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_top,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_bottom,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        "dark:bg-[linear-gradient(to_bottom,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
        className,
      )}
    />
  );
};
export default ThreeDMarquee;