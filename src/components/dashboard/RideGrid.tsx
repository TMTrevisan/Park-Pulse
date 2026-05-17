"use client";

import { Ride, WaitTimeSnapshot } from "@/lib/types";
import { RideCard } from "../RideCard";
import { WaitTimeChart } from "../WaitTimeChart";
import { getLand, getTicketClass, ResortId } from "@/lib/parks";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { Alert } from "@/hooks/useAlerts";
import { RideHeatmap } from "./RideHeatmap";

interface RideGridProps {
    rides: Ride[];
    searchQuery: string;
    expandedRideId: string | null;
    setExpandedRideId: (id: string | null) => void;
    history: WaitTimeSnapshot[];
    getHighOfDay: (ride: Ride) => number;
    favorites: string[];
    toggleFavorite: (id: string) => void;
    alerts: Alert[];
    onToggleAlert: (id: string, name: string) => void;
    resort: ResortId;
}

export function RideGrid({
    rides,
    searchQuery,
    expandedRideId,
    setExpandedRideId,
    history,
    getHighOfDay,
    favorites,
    toggleFavorite,
    alerts,
    onToggleAlert,
    resort
}: RideGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rides.map((ride) => {
                const land = getLand(ride.name, resort, ride.id);
                const ticket = getTicketClass(ride.name, resort, ride.id);
                const hasAlert = alerts.some(a => a.rideId === ride.id);
                return (
                    <div
                        key={ride.id}
                        className="group cursor-pointer"
                        onClick={() => setExpandedRideId(expandedRideId === ride.id ? null : ride.id)}
                    >
                        <div className={cn(
                            "transition-all duration-200",
                            expandedRideId === ride.id ? "col-span-1 md:col-span-2 row-span-2" : ""
                        )}>
                            <div className="relative">
                                <RideCard
                                    ride={ride}
                                    isFavorite={favorites.includes(ride.id)}
                                    toggleFavorite={toggleFavorite}
                                    hasAlert={hasAlert}
                                    onToggleAlert={onToggleAlert}
                                    land={land}
                                    ticket={ticket}
                                />
                            </div>

                            {expandedRideId === ride.id && (
                                <div className="mt-2 p-4 bg-white dark:bg-zinc-800 border rounded-lg shadow-sm animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-semibold">Live Wait Time Trend</h4>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            High of Day: <span className="font-bold text-gray-700 dark:text-gray-300">{getHighOfDay(ride)} min</span>
                                        </div>
                                    </div>
                                    <WaitTimeChart rideId={ride.id} ride={ride} history={history} resort={resort} />
                                    <RideHeatmap rideId={ride.id} history={history} />
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
            {rides.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                    No rides found matching &quot;{searchQuery}&quot;
                </div>
            )}
        </div>
    );
}
