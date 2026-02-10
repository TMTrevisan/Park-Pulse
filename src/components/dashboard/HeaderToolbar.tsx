"use client";

import { ParkLiveData } from "@/lib/types";
import { Search, LayoutGrid, List as ListIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { PARK_NAMES } from "@/lib/parks";

interface HeaderToolbarProps {
    selectedParkId: string;
    setSelectedParkId: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    viewMode: 'grid' | 'list';
    setViewMode: (mode: 'grid' | 'list') => void;
    showHours: boolean;
    setShowHours: (show: boolean) => void;
    loading: boolean;
    refreshData: () => void;

    // Filters
    ticketFilter: string;
    setTicketFilter: (v: string) => void;
    statusFilter: string;
    setStatusFilter: (v: string) => void;
    landFilter: string;
    setLandFilter: (v: string) => void;
    waitTimeFilter: string;
    setWaitTimeFilter: (v: string) => void;
    uniqueLands: string[];
}

export function HeaderToolbar({
    selectedParkId,
    setSelectedParkId,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    showHours,
    setShowHours,
    loading,
    refreshData,
    ticketFilter,
    setTicketFilter,
    statusFilter,
    setStatusFilter,
    landFilter,
    setLandFilter,
    waitTimeFilter,
    setWaitTimeFilter,
    uniqueLands
}: HeaderToolbarProps) {
    return (
        <>
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6 dark:bg-zinc-800 max-w-md">
                {Object.entries(PARK_NAMES).map(([id, name]) => (
                    <button
                        key={id}
                        onClick={() => setSelectedParkId(id)}
                        className={cn(
                            "w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all text-center",
                            selectedParkId === id
                                ? "bg-white text-blue-700 shadow dark:bg-zinc-700 dark:text-blue-400"
                                : "text-gray-500 hover:text-gray-700 hover:bg-white/[0.12] dark:text-gray-400"
                        )}
                    >
                        {name.replace("Disney ", "").replace(" Park", "")}
                    </button>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6 justify-between items-start lg:items-center">

                {/* Search & Filters Group */}
                <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full lg:w-auto">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search rides..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 h-[42px]"
                        />
                    </div>

                    {/* Filters */}
                    <select
                        value={landFilter}
                        onChange={(e) => setLandFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm h-[42px]"
                    >
                        <option value="All">All Lands</option>
                        {uniqueLands.map(land => (
                            <option key={land} value={land}>{land}</option>
                        ))}
                    </select>

                    <select
                        value={ticketFilter}
                        onChange={(e) => setTicketFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm h-[42px]"
                    >
                        <option value="All">All Tickets</option>
                        <option value="E">E-Ticket</option>
                        <option value="D">D-Ticket</option>
                        <option value="C">C-Ticket</option>
                        <option value="B">B-Ticket</option>
                        <option value="A">A-Ticket</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm h-[42px]"
                    >
                        <option value="All">All Status</option>
                        <option value="OPERATING">Operating</option>
                        <option value="DOWN">Down</option>
                        <option value="CLOSED">Closed</option>
                        <option value="REFURBISHMENT">Refurb</option>
                    </select>

                    <select
                        value={waitTimeFilter}
                        onChange={(e) => setWaitTimeFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm h-[42px]"
                    >
                        <option value="All">Any Wait</option>
                        <option value="15">&lt; 15 min</option>
                        <option value="30">&lt; 30 min</option>
                        <option value="45">&lt; 45 min</option>
                        <option value="60">&lt; 60 min</option>
                    </select>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {viewMode === 'list' && (
                        <button
                            onClick={() => setShowHours(!showHours)}
                            className={cn(
                                "px-3 py-2 text-sm font-medium rounded-lg border transition-colors h-[42px]",
                                showHours ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                            )}
                        >
                            {showHours ? "Hide Hours" : "Show Hours"}
                        </button>
                    )}

                    <div className="bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg flex border dark:border-zinc-700 h-[42px] items-center">
                        <button
                            id="view-toggle-grid"
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                viewMode === 'grid' ? "bg-white shadow-sm dark:bg-zinc-700" : "hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-500"
                            )}
                            title="Grid View"
                            aria-label="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            id="view-toggle-list"
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                viewMode === 'list' ? "bg-white shadow-sm dark:bg-zinc-700" : "hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-500"
                            )}
                            title="List View"
                            aria-label="List View"
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={refreshData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors h-[42px]"
                    >
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        <span className="hidden sm:inline">{loading ? "Updating..." : "Refresh"}</span>
                    </button>
                </div>
            </div>
        </>
    );
}
