"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Search, Activity } from "lucide-react";
import { PARK_NAMES, RESORT_PARKS } from "@/lib/parks";
import type { ResortId } from "@/lib/parks";
import { ComparativeTimeline } from "@/components/analytics/ComparativeTimeline";
import type { AnalyticsTimelinePoint } from "@/components/analytics/ComparativeTimeline";
import { cn } from "@/lib/utils";

interface AnalyticsDashboardProps {
    data: AnalyticsTimelinePoint[];
    ridesMeta: Record<string, { name: string, parkId: string }>;
    resort: ResortId;
}

export default function AnalyticsDashboard({ data, ridesMeta, resort }: AnalyticsDashboardProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRides, setSelectedRides] = useState<string[]>([]);
    const [parkFilter, setParkFilter] = useState<string>("ALL");

    const allRides = useMemo(() => {
        return Object.entries(ridesMeta).map(([id, meta]) => ({
            id,
            name: meta.name,
            parkId: meta.parkId
        }));
    }, [ridesMeta]);

    const filteredRides = useMemo(() => {
        return allRides.filter(ride => {
            if (parkFilter !== "ALL" && ride.parkId !== parkFilter) return false;
            if (searchQuery && !ride.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [allRides, searchQuery, parkFilter]);

    const toggleRide = (id: string) => {
        setSelectedRides(prev => 
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const clearSelection = () => setSelectedRides([]);

    // 6 distinct brand-aligned colors for the multi-line chart
    const colors = [
        "#3b82f6", // blue-500
        "#ec4899", // pink-500
        "#10b981", // emerald-500
        "#f59e0b", // amber-500
        "#8b5cf6", // violet-500
        "#ef4444", // red-500
    ];
    const parkIds = RESORT_PARKS[resort];

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col h-[100dvh]">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-2">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Pulse Dashboard
                    </Link>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Activity className="w-8 h-8 text-purple-500" />
                        Central Analytics Hub
                    </h1>
                    <p className="text-zinc-500 mt-1">Compare historical wait times across any attractions in real-time.</p>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 min-h-0">
                
                {/* Left Sidebar - Ride Selection */}
                <div className="w-full lg:w-80 flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex-shrink-0">
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                            <button 
                                onClick={() => setParkFilter("ALL")}
                                className={cn("flex-1 text-xs font-bold py-1.5 rounded-md transition-all", parkFilter === "ALL" ? "bg-white shadow-sm dark:bg-zinc-700 text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300")}
                            >
                                All Parks
                            </button>
                            {parkIds.map(parkId => (
                                <button
                                    key={parkId}
                                    onClick={() => setParkFilter(parkId)}
                                    className={cn("flex-1 text-xs font-bold py-1.5 rounded-md transition-all", parkFilter === parkId ? "bg-white shadow-sm dark:bg-zinc-700 text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300")}
                                >
                                    {PARK_NAMES[parkId]}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search attractions to compare..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-zinc-50 border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-shadow outline-none"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 layout-scrollbar">
                        {filteredRides.map(ride => {
                            const isSelected = selectedRides.includes(ride.id);
                            const selectionIndex = selectedRides.indexOf(ride.id);
                            const activeColor = selectionIndex !== -1 ? colors[selectionIndex % colors.length] : undefined;

                            return (
                                <button
                                    key={ride.id}
                                    onClick={() => toggleRide(ride.id)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-3 mb-1",
                                        isSelected 
                                            ? "bg-purple-50 dark:bg-purple-900/20 font-semibold" 
                                            : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
                                    )}
                                >
                                    <div 
                                        className={cn("w-3 h-3 rounded-full border-2 flex-shrink-0 transition-colors")}
                                        style={{ 
                                            borderColor: isSelected ? activeColor : 'var(--border)',
                                            backgroundColor: isSelected ? activeColor : 'transparent'
                                        }}
                                    />
                                    <span className={cn("truncate", isSelected && "text-zinc-900 dark:text-zinc-100")}>
                                        {ride.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Main Area - Chart */}
                <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 sm:p-6 lg:p-8 flex flex-col min-h-[500px]">
                    
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold">Comparative History</h2>
                            <p className="text-sm text-zinc-500 mt-1">
                                {selectedRides.length === 0 
                                    ? "Select up to 6 rides from the sidebar to begin comparison." 
                                    : `Comparing ${selectedRides.length} attraction${selectedRides.length !== 1 ? 's' : ''} over the course of today.`}
                            </p>
                        </div>
                        {selectedRides.length > 0 && (
                            <button 
                                onClick={clearSelection}
                                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="flex-1 min-h-[300px]">
                        {selectedRides.length > 0 ? (
                            <ComparativeTimeline data={data} ridesMeta={ridesMeta} selectedRides={selectedRides} colors={colors} resort={resort} />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 p-6 text-center">
                                <Activity className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                                <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300">No Attractions Selected</h3>
                                <p className="text-sm text-zinc-500 max-w-sm mt-2">
                                    Use the left sidebar to select rides across the resort. Watch their historical queues map out across a synchronized timeline matrix!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
