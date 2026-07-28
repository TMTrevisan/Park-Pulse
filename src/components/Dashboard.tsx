"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { WaitTimeSnapshot, Ride } from "@/lib/types";
import { PARKS, RESORT_PARKS, getTicketClass, getLand, getDefaultParkForResort } from "@/lib/parks";
import type { ResortId } from "@/lib/parks";
import { HeaderToolbar } from "./dashboard/HeaderToolbar";
import type { SortField, SortDirection } from "./dashboard/RideTable";
import { useFavorites } from "@/hooks/useFavorites";
import { useAlerts } from "@/hooks/useAlerts";
import { Skeleton } from "@/components/ui/Skeleton";
import { ParkPulseHeader, ParkStats } from "./dashboard/ParkPulseHeader";

function DeferredViewFallback() {
    return <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40">Loading this view…</div>;
}

// These modes bring in Mapbox, drag-and-drop, and charting code. Keep the default
// wait-time screen lean and only fetch each feature when the user selects it.
const RideGrid = dynamic(() => import("./dashboard/RideGrid").then(module => module.RideGrid), {
    ssr: false,
    loading: DeferredViewFallback,
});
const RideTable = dynamic(() => import("./dashboard/RideTable").then(module => module.RideTable), {
    ssr: false,
    loading: DeferredViewFallback,
});
const MapOverlay = dynamic(() => import("./dashboard/MapOverlay"), {
    ssr: false,
    loading: DeferredViewFallback,
});
const RopeDropItinerary = dynamic(() => import("./dashboard/RopeDropItinerary").then(module => module.RopeDropItinerary), {
    ssr: false,
    loading: DeferredViewFallback,
});

const REFRESH_INTERVAL = 60 * 1000;
const MAX_CLIENT_HISTORY_ITEMS = 10_080;
const TARGET_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

function getParkDateKey(date: Date, resort: ResortId) {
    const timeZone = resort === 'WDW' ? 'America/New_York' : 'America/Los_Angeles';
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${values.year}-${values.month}-${values.day}`;
}

export function Dashboard() {
    const [resort, setResort] = useState<ResortId>('DLR');
    const [data, setData] = useState<{ current: WaitTimeSnapshot; history: WaitTimeSnapshot[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedParkId, setSelectedParkId] = useState(PARKS.DISNEYLAND_PARK);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map' | 'rope-drop'>('list');
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

    const fetchData = useCallback(async (isInitial = false, currentResort: ResortId = resort, signal?: AbortSignal) => {
        if (isInitial) setLoading(true);
        try {
            // Current waits are enough for the first useful screen. Loading a large
            // history payload here delayed startup on slower connections.
            const url = `/api/wait-times?resort=${currentResort}&history=false`;
            const response = await fetch(url, { signal });
            if (!response.ok) throw new Error('Failed to fetch data');
            const result = await response.json();

            setError(null);
            setData(prev => {
                if (!prev || isInitial) return result;
                return {
                    current: result.current,
                    history: [...prev.history, result.current].slice(-MAX_CLIENT_HISTORY_ITEMS)
                };
            });
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            console.error("Failed to fetch wait times:", error);
            setError("Live wait times could not be refreshed. Please try again.");
        } finally {
            if (isInitial && !signal?.aborted) setLoading(false);
        }
    }, [resort]);

    const fetchHistory = useCallback(async (currentResort: ResortId, signal?: AbortSignal) => {
        try {
            const response = await fetch(`/api/wait-times?resort=${currentResort}`, { signal });
            if (!response.ok) return;
            const result = await response.json() as { history: WaitTimeSnapshot[] };
            setData(previous => previous ? {
                current: previous.current,
                history: result.history.slice(-MAX_CLIENT_HISTORY_ITEMS),
            } : previous);
        } catch (error) {
            if (!(error instanceof DOMException && error.name === 'AbortError')) {
                console.warn('Historical wait data is temporarily unavailable:', error);
            }
        }
    }, []);

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
        const controller = new AbortController();
        fetchData(true, resort, controller.signal);
        // Defer nonessential charts/history until the live table has had a chance to paint.
        const historyTimer = window.setTimeout(() => fetchHistory(resort, controller.signal), 1_500);
        const interval = setInterval(() => fetchData(false, resort, controller.signal), REFRESH_INTERVAL);
        return () => {
            controller.abort();
            window.clearTimeout(historyTimer);
            clearInterval(interval);
        };
    }, [fetchData, fetchHistory, resort]);

    const currentPark = data?.current.parks.find((p) => p.id === selectedParkId);

    const uniqueLands = useMemo(() => {
        if (!currentPark) return [];
        const lands = new Set(currentPark.liveData.map(r => getLand(r.name, resort, r.id)));
        return Array.from(lands).sort();
    }, [currentPark, resort]);

    const getHighOfDay = useCallback((ride: Ride) => {
        let max = 0;
        const today = getParkDateKey(new Date(), resort);
        const todayForecasts = ride.forecast?.filter(f => getParkDateKey(new Date(f.time), resort) === today) || [];
        if (todayForecasts.length > 0) {
            max = Math.max(...todayForecasts.map(f => f.waitTime));
        }

        for (const snapshot of data?.history || []) {
            for (const park of snapshot.parks) {
                const matchedRide = park.liveData.find(r => r.id === ride.id);
                const wait = matchedRide?.queue?.STANDBY?.waitTime;
                if (typeof wait === 'number' && wait > max) max = wait;
            }
        }

        const currentWait = ride.queue?.STANDBY?.waitTime;
        return typeof currentWait === 'number' ? Math.max(max, currentWait) : max;
    }, [data, resort]);

    const rides = useMemo(() => {
        const sourceRides = viewMode === 'map'
            ? (data?.current.parks.flatMap(p => p.liveData) || [])
            : (currentPark?.liveData || []);

        const filtered = sourceRides.filter((ride) => {
            if (ride.entityType !== "ATTRACTION" || ride.status === "REFURBISHMENT") return false;
            if (!ride.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

            if (ticketFilter !== "All") {
                const ticket = getTicketClass(ride.name, resort, ride.id);
                if (ticket !== ticketFilter) return false;
            }
            if (statusFilter !== "All") {
                if (ride.status !== statusFilter) return false;
            }
            if (landFilter !== "All") {
                const land = getLand(ride.name, resort, ride.id);
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
                    valA = getLand(a.name, resort, a.id); valB = getLand(b.name, resort, b.id);
                    break;
                case 'status':
                    valA = a.status; valB = b.status;
                    break;
                case 'ticket': {
                    const score = (r: Ride) => {
                        const t = getTicketClass(r.name, resort, r.id);
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
        ticketFilter, statusFilter, landFilter, waitTimeFilter, getHighOfDay, resort]);

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

    const getParkStats = useCallback((parkId: string): ParkStats => {
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
    }, [data]);

    // Build stats for all parks in the current resort
    const parkStats = useMemo(() => {
        const stats: Record<string, ParkStats> = {};
        for (const parkId of RESORT_PARKS[resort]) {
            stats[parkId] = getParkStats(parkId);
        }
        return stats;
    }, [resort, getParkStats]);

    if (loading && !data) {
        return (
            <main className="min-h-screen bg-white dark:bg-black p-4 md:p-8 font-sans">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <Skeleton className="h-10 w-64 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Link href="/parks" className="inline-flex h-12 items-center rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
                            Explore all parks
                        </Link>
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
            case 'rope-drop': {
                const allMapRides = data?.current.parks.flatMap(p => p.liveData) || [];
                return (
                    <div className="h-[70vh] min-h-[500px]">
                        <RopeDropItinerary rides={allMapRides} resort={resort} />
                    </div>
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
                    resort={resort}
                />

                {error && (
                    <div role="alert" className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
                        <span>{error}</span>
                        <button onClick={() => fetchData(true)} className="font-semibold underline underline-offset-2">Retry</button>
                    </div>
                )}

                {renderContent()}

                <footer className="mt-12 text-center text-xs text-zinc-400 dark:text-zinc-600 pb-8">
                    Wait times powered by ThemeParks API and Queue-Times.com.
                    <br />
                    <span className="opacity-50">Build v1.1.18-UI-Fixed</span>
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
