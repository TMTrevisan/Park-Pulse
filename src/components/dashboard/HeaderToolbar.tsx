import { useState } from "react";
import { ParkLiveData } from "@/lib/types";
import { Search, LayoutGrid, List as ListIcon, RefreshCw, Map as MapIcon, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderToolbarProps {
    selectedParkId: string;
    setSelectedParkId: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    viewMode: 'grid' | 'list' | 'map';
    setViewMode: (mode: 'grid' | 'list' | 'map') => void;
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
}: Omit<HeaderToolbarProps, 'selectedParkId' | 'setSelectedParkId'>) {
    const [showFilters, setShowFilters] = useState(false);

    const activeFilters = [
        landFilter !== "All" ? 1 : 0,
        ticketFilter !== "All" ? 1 : 0,
        statusFilter !== "All" ? 1 : 0,
        waitTimeFilter !== "All" ? 1 : 0
    ].reduce((a, b) => a + b, 0);

    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                {/* Search & Toggle Filters Group */}
                <div className="flex gap-2 w-full sm:w-auto items-center">
                    <div className="relative flex-1 min-w-[200px] sm:min-w-[240px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search rides..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm h-[42px] focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400"
                        />
                    </div>
                    
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "px-3 py-2 rounded-lg border text-sm flex items-center gap-2 h-[42px] transition-colors relative flex-shrink-0",
                            showFilters || activeFilters > 0
                                ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" 
                                : "bg-white dark:bg-zinc-800 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                        )}
                    >
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">Filters</span>
                        {activeFilters > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in">
                                {activeFilters}
                            </span>
                        )}
                    </button>
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
                        <button
                            id="view-toggle-map"
                            onClick={() => setViewMode('map')}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                viewMode === 'map' ? "bg-white shadow-sm dark:bg-zinc-700" : "hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-500"
                            )}
                            title="Map View"
                            aria-label="Map View"
                        >
                            <MapIcon className="w-4 h-4" />
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

            {/* Expandable Filter Drawer */}
            {showFilters && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 animate-in slide-in-from-top-2 fade-in relative z-10 bg-zinc-50/80 dark:bg-zinc-800/30 p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/50 mt-1">
                    <select
                        value={landFilter}
                        onChange={(e) => setLandFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm h-[42px] w-full"
                    >
                        <option value="All">All Lands</option>
                        {uniqueLands.map(land => (
                            <option key={land} value={land}>{land}</option>
                        ))}
                    </select>

                    <select
                        value={ticketFilter}
                        onChange={(e) => setTicketFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm h-[42px] w-full"
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
                        className="px-3 py-2 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm h-[42px] w-full"
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
                        className="px-3 py-2 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm h-[42px] w-full"
                    >
                        <option value="All">Any Wait</option>
                        <option value="15">&lt; 15 min</option>
                        <option value="30">&lt; 30 min</option>
                        <option value="45">&lt; 45 min</option>
                        <option value="60">&lt; 60 min</option>
                    </select>
                </div>
            )}
        </div>
    );
}
