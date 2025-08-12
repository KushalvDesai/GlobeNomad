import { motion } from "framer-motion";
import { Calendar, MapPin, DollarSign, Clock } from "lucide-react";
import { Trip } from "@/graphql/types";

interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
}

export function TripCard({ trip, onClick }: TripCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDuration = () => {
    if (!trip.startDate || !trip.endDate) return null;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card card-hover cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6">
        {/* Trip Title */}
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2 line-clamp-2">
          {trip.title}
        </h3>

        {/* Trip Description */}
        {trip.description && (
          <p className="text-[var(--muted-foreground)] text-sm mb-4 line-clamp-2">
            {trip.description}
          </p>
        )}

        {/* Trip Details */}
        <div className="space-y-3">
          {/* Dates */}
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </span>
          </div>

          {/* Duration */}
          {getDuration() && (
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Clock className="w-4 h-4" />
              <span>{getDuration()}</span>
            </div>
          )}

          {/* Budget */}
          {trip.estimatedBudget && (
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <DollarSign className="w-4 h-4" />
              <span>
                {trip.currency || "USD"} {trip.estimatedBudget.toLocaleString()}
                {trip.actualBudget && (
                  <span className="ml-1 text-xs">
                    (Actual: {trip.currency || "USD"} {trip.actualBudget.toLocaleString()})
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Trip Status */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {trip.isPublic && (
              <span className="px-2 py-1 text-xs rounded-full bg-[var(--accent-1)] text-[var(--foreground)]">
                Public
              </span>
            )}
          </div>
          <span className="text-xs text-[var(--muted-foreground)]">
            Created {new Date(trip.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}