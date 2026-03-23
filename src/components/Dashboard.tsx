"use client";

import { useEffect, useState, useMemo } from "react";
import { WaitTimeSnapshot, Ride } from "@/lib/types";

import { PARKS, getTicketClass, getLand } from "@/lib/parks";
import { HeaderToolbar } from "./dashboard/HeaderToolbar";
import { RideGrid } from "./dashboard/RideGrid";
import { RideTable, SortField, SortDirection } from "./dashboard/RideTable";
import MapOverlay from "./dashboard/MapOverlay";
import { useFavorites } from "@/hooks/useFavorites";
import { useAlerts } from "@/hooks/useAlerts";
import { Skeleton } from "@/components/ui/Skeleton";
import { ParkPulseHeader, ParkStats } from "./dashboard/ParkPulseHeader";

const REFRESH_INTERVAL = 60 * 1000; // 1 minute
const TARGET_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

export function Dashboard() {
    const [data, setData] = useState<{ current: WaitTimeSnapshot; history: WaitTimeSnapshot[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedParkId, setSelectedParkId] = useState(PARKS.DISNEYLAND_PARK);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('list');
    const [expandedRideId, setExpandedRideId] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('waitTime');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [showHours, setShowHours] = useState(false);

    // Filters
    const [ticketFilter, setTicketFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [landFilter, setLandFilter] = useState("All");
    const [waitTimeFilter, setWaitTimeFilter] = useState("All");

    const { favorites, toggleFavorite } = useFavorites();
    const { alerts, addAlert, removeAlert, checkAlerts } = useAlerts();

    const fetchData = async (isInitial = false) => {
        if (isInitial) setLoading(true);
        try {
            const response = await fetch(`/api/wait-times${isInitial ? '' : '?history=false'}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const result = await response.json();

            setData(prev => {
                if (!prev || isInitial) return result;

                // Keep the massive history in memory, just append the new live snapshot
                return {
                    current: result.current,
                    history: [...prev.history, result.current]
                };
            });
        } catch (error) {
            console.error("Failed to fetch wait times:", error);
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(true);
        const interval = setInterval(() => fetchData(false), REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    const currentPark = data?.current.parks.find((p) => p.id === selectedParkId);

    const uniqueLands = useMemo(() => {
        if (!currentPark) return [];
        const lands = new Set(currentPark.liveData.map(r => getLand(r.name)));
        return Array.from(lands).sort();
    }, [currentPark]);

    const rides = useMemo(() => {
        const sourceRides = viewMode === 'map' 
            ? (data?.current.parks.flatMap(p => p.liveData) || []) 
            : (currentPark?.liveData || []);

        const filtered = sourceRides.filter((ride) => {
            // Basic checks
            if (ride.entityType !== "ATTRACTION" || ride.status === "REFURBISHMENT") return false;
            if (!ride.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

            // Ticket Filter
            if (ticketFilter !== "All") {
                const ticket = getTicketClass(ride.name);
                if (ticket !== ticketFilter) return false;
            }

            // Status Filter
            if (statusFilter !== "All") {
                if (ride.status !== statusFilter) return false;
            }

            // Land Filter
            if (landFilter !== "All") {
                const land = getLand(ride.name);
                if (land !== landFilter) return false;
            }

            // Wait Time Filter
            if (waitTimeFilter !== "All") {
                const wait = ride.queue?.STANDBY?.waitTime ?? 0;
                const maxWait = parseInt(waitTimeFilter);
                if (wait > maxWait) return false;
            }

            return true;
        });

        return filtered.sort((a, b) => {
            let valA: string | number = '';
            let valB: string | number = '';

            switch (sortField) {
                case 'favorite':
                    valA = favorites.includes(a.id) ? 1 : 0;
                    valB = favorites.includes(b.id) ? 1 : 0;
                    break;
                case 'name':
                    valA = a.name;
                    valB = b.name;
                    break;
                case 'waitTime':
                    valA = a.status === 'OPERATING' ? (a.queue?.STANDBY?.waitTime ?? 0) : -1;
                    valB = b.status === 'OPERATING' ? (b.queue?.STANDBY?.waitTime ?? 0) : -1;
                    break;
                case 'land':
                    valA = getLand(a.name);
                    valB = getLand(b.name);
                    break;
                case 'status':
                    valA = a.status;
                    valB = b.status;
                    break;
                case 'ticket':
                    const score = (r: Ride) => {
                        const t = getTicketClass(r.name);
                        const map: Record<string, number> = { 'E': 5, 'D': 4, 'C': 3, 'B': 2, 'A': 1 };
                        return map[t] || 0;
                    };
                    valA = score(a);
                    valB = score(b);
                    break;
                case 'peak':
                    valA = getHighOfDay(a);
                    valB = getHighOfDay(b);
                    break;
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    }, [currentPark, searchQuery, sortField, sortDirection, favorites, ticketFilter, statusFilter, landFilter, waitTimeFilter]);

    // Check alerts whenever rides update
    useEffect(() => {
        if (rides.length > 0) {
            checkAlerts(rides);
        }
    }, [rides, checkAlerts]);

    const handleToggleAlert = (rideId: string, rideName: string) => {
        const existing = alerts.find(a => a.rideId === rideId);
        if (existing) {
            removeAlert(rideId);
        } else {
            const input = window.prompt(`Alert when wait time for ${rideName} is less than or equal to (minutes):`, "30");
            if (input) {
                const threshold = parseInt(input, 10);
                if (!isNaN(threshold)) {
                    addAlert(rideId, rideName, threshold);
                }
            }
        }
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const getHighOfDay = (ride: Ride) => {
        if (!ride.forecast) return 0;
        const today = new Date().toDateString();
        const todayForecasts = ride.forecast.filter(f => new Date(f.time).toDateString() === today);
        if (todayForecasts.length === 0) return 0;
        return Math.max(...todayForecasts.map(f => f.waitTime));
    };

    const getParkStats = (parkId: string): ParkStats => {
        const park = data?.current.parks.find(p => p.id === parkId);
        if (!park?.liveData) return { averageWait: 0, busyness: { label: "Unknown", color: "text-zinc-500", bg: "bg-zinc-500" } };

        const operatingRides = park.liveData.filter((r) =>
            r.entityType === "ATTRACTION" &&
            r.status === "OPERATING" &&
            typeof r.queue?.STANDBY?.waitTime === 'number'
        );

        const averageWait = operatingRides.length
            ? Math.round(operatingRides.reduce((acc, r) => acc + (r.queue?.STANDBY?.waitTime || 0), 0) / operatingRides.length)
            : 0;

        let busyness = { label: "Quiet", color: "text-green-500", bg: "bg-green-500" };
        if (averageWait >= 50) busyness = { label: "Very Busy", color: "text-red-600", bg: "bg-red-600" };
        else if (averageWait >= 30) busyness = { label: "Busy", color: "text-orange-500", bg: "bg-orange-500" };
        else if (averageWait >= 15) busyness = { label: "Moderate", color: "text-yellow-500", bg: "bg-yellow-500" };

        return { averageWait, busyness };
    };

    const disneylandStats = useMemo(() => getParkStats(PARKS.DISNEYLAND_PARK), [data]);
    const dcaStats = useMemo(() => getParkStats(PARKS.DISNEY_CALIFORNIA_ADVENTURE), [data]);

    if (loading && !data) {
        return (
            <main className="min-h-screen bg-white dark:bg-black p-4 md:p-8 font-sans">
                <div className="max-w-7xl mx-auto">
                    {/* Header Skeleton */}
                    <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <Skeleton className="h-10 w-64 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-12 w-48 rounded-lg" />
                    </div>

                    {/* Toolbar Skeleton */}
                    <div className="mb-6">
                        <Skeleton className="h-10 w-full max-w-md rounded-xl mb-6" />
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <Skeleton className="h-10 w-64" />
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </div>
                    </div>

                    {/* Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-lg" />
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    const renderContent = () => {
        switch (viewMode) {
            case 'grid':
                return (
                    <RideGrid
                        rides={rides}
                        searchQuery={searchQuery}
                        expandedRideId={expandedRideId}
                        setExpandedRideId={setExpandedRideId}
                        history={data?.history || []}
                        getHighOfDay={getHighOfDay}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                        alerts={alerts}
                        onToggleAlert={handleToggleAlert}
                    />
                );
            case 'map':
                const allMapRides = data?.current.parks.flatMap(p => p.liveData) || [];
                return (
                    <MapOverlay 
                        rides={allMapRides} 
                        selectedParkId={selectedParkId} 
                    />
                );
            case 'list':
            default:
                return (
                    <RideTable
                        rides={rides}
                        searchQuery={searchQuery}
                        expandedRideId={expandedRideId}
                        setExpandedRideId={setExpandedRideId}
                        history={data?.history || []}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        handleSort={handleSort}
                        getHighOfDay={getHighOfDay}
                        showHours={showHours}
                        TARGET_HOURS={TARGET_HOURS}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                        alerts={alerts}
                        onToggleAlert={handleToggleAlert}
                    />
                );
        }
    };

    return (
        <main className="min-h-screen bg-white dark:bg-black p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <ParkPulseHeader
                    disneyland={disneylandStats}
                    dca={dcaStats}
                    selectedParkId={selectedParkId}
                    onParkSelect={setSelectedParkId}
                />

                <HeaderToolbar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    showHours={showHours}
                    setShowHours={setShowHours}
                    loading={loading}
                    refreshData={fetchData}
                    ticketFilter={ticketFilter}
                    setTicketFilter={setTicketFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    landFilter={landFilter}
                    setLandFilter={setLandFilter}
                    waitTimeFilter={waitTimeFilter}
                    setWaitTimeFilter={setWaitTimeFilter}
                    uniqueLands={uniqueLands}
                />

                {renderContent()}

                {/* Attribution Footer */}
                <footer className="mt-12 text-center text-xs text-zinc-400 dark:text-zinc-600 pb-8">
                    Wait times powered by ThemeParks API and Queue-Times.com.
                    <br />
                    <a href="https://queue-times.com/en-US" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors hover:underline mt-1 inline-block font-medium">
                        Visit Queue-Times.com
                    </a>
                </footer>
            </div>
        </main>
    );
}
