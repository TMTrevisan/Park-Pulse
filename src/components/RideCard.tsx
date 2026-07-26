import { Ride } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Clock, AlertCircle, Star, Bell, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ResortId } from "@/lib/parks";

interface RideCardProps {
    ride: Ride;
    isFavorite: boolean;
    toggleFavorite: (id: string) => void;
    hasAlert?: boolean;
    onToggleAlert?: (id: string, name: string) => void;
    land?: string;
    ticket?: string;
    resort: ResortId;
}

export function RideCard({ ride, isFavorite, toggleFavorite, hasAlert, onToggleAlert, land, ticket, resort }: RideCardProps) {
    const isOperating = ride.status === "OPERATING";
    const waitTime = ride.queue?.STANDBY?.waitTime ?? 0;
    const statusColor = isOperating
        ? waitTime > 60
            ? "text-red-500"
            : waitTime > 30
                ? "text-yellow-500"
                : "text-green-500"
        : "text-gray-400";

    return (
        <Link href={`/ride/${ride.id}?resort=${resort}`} className="p-4 border rounded-lg shadow-sm bg-white dark:bg-zinc-800 dark:border-zinc-700 flex flex-col justify-between h-full relative group/card hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer block">
            <div className="flex justify-between items-start gap-2">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg line-clamp-1 pr-12 group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors">{ride.name}</h3>
                        {ticket && ticket !== '—' && (
                            <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-[10px] font-black border dark:border-zinc-600 shrink-0">
                                {ticket}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500 capitalize">{ride.entityType}</p>
                        {land && land !== '—' && (
                            <>
                                <span className="text-gray-300">|</span>
                                <p className="text-xs font-medium text-blue-500 dark:text-blue-400">{land}</p>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex gap-1 absolute top-4 right-4 z-10">
                    {onToggleAlert && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleAlert(ride.id, ride.name);
                            }}
                            className={cn(
                                "p-1 rounded-full transition-all focus:outline-none",
                                hasAlert
                                    ? "text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                    : "text-gray-300 hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 opacity-0 group-hover/card:opacity-100"
                            )}
                            title={hasAlert ? "Remove alert" : "Set wait time alert"}
                        >
                            <Bell className={cn("w-5 h-5", hasAlert && "fill-current")} />
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(ride.id);
                        }}
                        className={cn(
                            "p-1 rounded-full transition-all focus:outline-none",
                            isFavorite
                                ? "text-yellow-500 hover:text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
                                : "text-gray-300 hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 opacity-0 group-hover/card:opacity-100"
                        )}
                        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Star className={cn("w-5 h-5", isFavorite && "fill-current")} />
                    </button>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className={cn("flex items-center gap-2", statusColor)}>
                    {isOperating ? (
                        <>
                            <Clock className="w-5 h-5" />
                            <span className="font-bold text-xl">{waitTime} min</span>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium capitalize">{ride.status.toLowerCase()}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center text-gray-400 group-hover/card:text-blue-500 transition-colors text-xs font-medium">
                    <span className="opacity-0 group-hover/card:opacity-100 transition-opacity -mr-1">Analyze</span>
                    <ChevronRight className="w-4 h-4 ml-1 opacity-50 group-hover/card:opacity-100 transition-opacity" />
                </div>
            </div>
        </Link>
    );
}
