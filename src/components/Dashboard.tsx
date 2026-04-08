"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { WaitTimeSnapshot, Ride } from "@/lib/types";
import { PARKS, RESORT_PARKS, getTicketClass, getLand, getDefaultParkForResort } from "@/lib/parks";
import type { ResortId } from "@/lib/parks";
import { HeaderToolbar } from "./dashboard/HeaderToolbar";
import { RideGrid } from "./dashboard/RideGrid";
import { RideTable, SortField, SortDirection } from "./dashboard/RideTable";
import MapOverlay from "./dashboard/MapOverlay";
import { useFavorites } from "@/hooks/useFavorites";
import { useAlerts } from "@/hooks/useAlerts";
import { Skeleton } from "@/components/ui/Skeleton";
import { ParkPulseHeader, ParkStats } from "./dashboard/ParkPulseHeader";

const REFRESH_INTERVAL = 60 * 1000;
const TARGET_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

export function Dashboard() {
    const [resort, setResort] = useState<ResortId>('DLR');
    const [data, setData] = useState<{ current: WaitTimeSnapshot; history: WaitTimeSnapshot[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedParkId, setSelectedParkId] = useState(PARKS.DISNEYLAND_PARK);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('list');
    const [expandedRideId, setExpandedRideId] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('waitTime');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [showHours, setShowHours] = useState(false);

    const [ticketFilter, setTicketFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [landFilter, setLandFilter] = useState("All");
    const [waitTimeFilter, setWaitTimeFilter] = useState("All");

    const { favorites, toggleFavorite } = useFavorites();
    const { alerts, addAlert, removeAlert, checkAlerts } = useAlerts();

    const fetchData = useCallback(async (isInitial = false, currentResort: ResortId = resort) => {
        if (isInitial) setLoading(true);
        try {
            const url = `/api/wait-times?resort=${currentResort}${isInitial ? '' : '&history=false'}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch data');
            const result = await response.json();

            setData(prev => {
                if (!prev || isInitial) return result;
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
    }, [resort]);

    // When resort changes: reset park selection, clear data, re-fetch
    const handleResortChange = (newResort: ResortId) => {
        setResort(newResort);
        setSelectedParkId(getDefaultParkForResort(newResort));
        setData(null);
        setLoading(true);
        // Reset filters too since lands differ
        setLandFilter("All");
        setTicketFilter("All");
        setStatusFilter("All");
        setWaitTimeFilter("All");
    };

    useEffect(() => {
        fetchData(true, resort);
        const interval = setInterval(() => fetchData(false, resort), REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [resort]);

    const currentPark = data?.current.parks.find((p) => p.id === selectedParkId);

    const uniqueLands = useMemo(() => {
        if (!currentPark) return [];
        const lands = new Set(currentPark.liveData.map(r => getLand(r.name, resort)));
        return Array.from(lands).sort();
    }, [currentPark, resort]);

    const rides = useMemo(() => {
        const sourceRides = viewMode === 'map'
            ? (data?.current.parks.flatMap(p => p.liveData) || [])
            : (currentPark?.liveData || []);

        const filtered = sourceRides.filter((ride) => {
            if (ride.entityType !== "ATTRACTION" || ride.status === "REFURBISHMENT") return false;
            if (!ride.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

            if (ticketFilter !== "All") {
                const ticket = getTicketClass(ride.name, resort);
                if (ticket !== ticketFilter) return false;
            }
            if (statusFilter !== "All") {
                if (ride.status !== statusFilter) return false;
            }
            if (landFilter !== "All") {
                const land = getLand(ride.name, resort);
                if (land !== landFilter) return false;
            }
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
                    valA = a.name; valB = b.name;
                    break;
                case 'waitTime':
                    valA = a.status === 'OPERATING' ? (a.queue?.STANDBY?.waitTime ?? 0) : -1;
                    valB = b.status === 'OPERATING' ? (b.queue?.STANDBY?.waitTime ?? 0) : -1;
                    break;
                case 'land':
                    valA = getLand(a.name, resort); valB = getLand(b.name, resort);
                    break;
                case 'status':
                    valA = a.status; valB = b.status;
                    break;
                case 'ticket': {
                    const score = (r: Ride) => {
                        const t = getTicketClass(r.name, resort);
                        const map: Record<string, number> = { E: 5, D: 4, C: 3, B: 2, A: 1 };
                        return map[t] || 0;
                    };
                    valA = score(a); valB = score(b);
                    break;
                }
                case 'peak':
                    valA = getHighOfDay(a); valB = getHighOfDay(b);
                    break;
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    }, [currentPark, data, viewMode, searchQuery, sortField, sortDirection, favorites,
        ticketFilter, statusFilter, landFilter, waitTimeFilter]);

    useEffect(() => {
        if (rides.length > 0) checkAlerts(rides);
    }, [rides, checkAlerts]);

    const handleToggleAlert = (rideId: string, rideName: string) => {
        const existing = alerts.find(a => a.rideId === rideId);
        if (existing) {
            removeAlert(rideId);
        } else {
            const input = window.prompt(`Alert when ${rideName} is ≤ (minutes):`, "30");
            if (input) {
                const threshold = parseInt(input, 10);
                if (!isNaN(threshold)) addAlert(rideId, rideName, threshold);
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

    const getHighOfDay = useCallback((ride: Ride) => {
        let max = 0;

        // 1. Try real-time API forecast for today
        const today = new Date().toDateString();
        const todayForecasts = ride.forecast?.filter(f => new Date(f.time).toDateString() === today) || [];
        if (todayForecasts.length > 0) {
            max = Math.max(...todayForecasts.map(f => f.waitTime));
        }

        // 2. Fallback: Check historical snapshots from the data.history state
        if (data?.history && data.history.length > 0) {
            const snapshots = data.history;
            for (const snapshot of snapshots) {
                // Check all parks in the snapshot for this ride
                for (const park of snapshot.parks) {
                    const matchedRide = park.liveData.find(r => r.id === ride.id);
                    const wait = matchedRide?.queue?.STANDBY?.waitTime;
                    if (typeof wait === 'number' && wait > max) {
                        max = wait;
                    }
                }
            }
        }

        // 3. Final check against current wait time
        const currentWait = ride.queue?.STANDBY?.waitTime;
        if (typeof currentWait === 'number' && currentWait > max) {
            max = currentWait;
        }

        return max;
    }, [data]);

    const getParkStats = (parkId: string): ParkStats => {
        const park = data?.current.parks.find(p => p.id === parkId);
        if (!park?.liveData) return {
            averageWait: 0,
            busyness: { label: "Unknown", color: "text-zinc-500", bg: "bg-zinc-500" }
        };

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

    // Build stats for all parks in the current resort
    const parkStats = useMemo(() => {
        const stats: Record<string, ParkStats> = {};
        for (const parkId of RESORT_PARKS[resort]) {
            stats[parkId] = getParkStats(parkId);
        }
        return stats;
    }, [data, resort]);

    if (loading && !data) {
        return (
            <main className="min-h-screen bg-white dark:bg-black p-4 md:p-8 font-sans">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <Skeleton className="h-10 w-64 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-12 w-48 rounded-lg" />
                    </div>
                    <div className="mb-6">
                        <Skeleton className="h-10 w-full max-w-md rounded-xl mb-6" />
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <Skeleton className="h-10 w-64" />
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </div>
                    </div>
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
                        resort={resort}
                    />
                );
            case 'map': {
                const allMapRides = data?.current.parks.flatMap(p => p.liveData) || [];
                return (
                    <MapOverlay
                        rides={allMapRides}
                        selectedParkId={selectedParkId}
                        resort={resort}
                        activeLand={landFilter}
                    />
                );
            }
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
                        resort={resort}
                    />
                );
        }
    };

    return (
        <main className="min-h-screen bg-white dark:bg-black p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <ParkPulseHeader
                    parkStats={parkStats}
                    selectedParkId={selectedParkId}
                    onParkSelect={setSelectedParkId}
                    resort={resort}
                    onResortChange={handleResortChange}
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

                <footer className="mt-12 text-center text-xs text-zinc-400 dark:text-zinc-600 pb-8">
                    Wait times powered by ThemeParks API and Queue-Times.com.
                    <br />
                    <span className="opacity-50">Build v1.1.13-Registry-Hotfix</span>
                    <br />
                    <a href="https://queue-times.com/en-US" target="_blank" rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-400 transition-colors hover:underline mt-1 inline-block font-medium">
                        Visit Queue-Times.com
                    </a>
                </footer>
            </div>
        </main>
    );
}
