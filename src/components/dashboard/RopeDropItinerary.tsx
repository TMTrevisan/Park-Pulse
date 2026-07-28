"use client";

import { useState, useEffect, useRef } from "react";
import { Ride } from "@/lib/types";
import { useItinerary, ItineraryItem } from "@/hooks/useItinerary";
import { ResortId, getLand } from "@/lib/parks";
import { Search, Plus, GripVertical, Check, Trash2, Clock, Route as RouteIcon, MapPin, PersonStanding, Trash, Save, FolderOpen } from "lucide-react";
import { cn, getWaitTimeDelta, calculateDistance, estimateWalkTimeMinutes } from "@/lib/utils";
import rideCoords from "@/lib/ride-coords.json";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const getWaitColorText = (minutes: number) => {
    if (minutes <= 15) return 'text-emerald-600 dark:text-emerald-400';
    if (minutes <= 35) return 'text-amber-600 dark:text-amber-500';
    if (minutes <= 60) return 'text-orange-500 dark:text-orange-400';
    return 'text-rose-600 dark:text-rose-500';
};

type RideCoordinate = { lat: number; lng: number };
type AugmentedItineraryItem = ItineraryItem & {
    walkTimeMins: number;
    arrivalTimeMs?: number;
    expectedWaitMins?: number;
    departureTimeMs?: number;
    isForecast?: boolean;
    liveWaitMins?: number;
    status?: string;
};

const RIDE_COORDS = rideCoords as Record<string, RideCoordinate>;

// --- Draggable Itinerary Item Component ---
function SortableItineraryRow({ 
    item, 
    ride, 
    onToggle, 
    onRemove,
    isFirstIncomplete
}: { 
    item: ItineraryItem & { 
        walkTimeMins?: number; 
        arrivalTimeMs?: number; 
        expectedWaitMins?: number; 
        departureTimeMs?: number; 
        isForecast?: boolean; 
        liveWaitMins?: number;
        status?: string;
    };
    ride?: Ride;
    onToggle: (id: string) => void;
    onRemove: (id: string) => void;
    isFirstIncomplete: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    const prevWait = useRef(item.expectedWaitMins);
    const prevWalk = useRef(item.walkTimeMins);
    const [flashColor, setFlashColor] = useState<string | null>(null);

    useEffect(() => {
        let changed = false;
        let isWorseChange = false;

        if (prevWait.current !== undefined && item.expectedWaitMins !== undefined && prevWait.current !== item.expectedWaitMins) {
            changed = true;
            if (item.expectedWaitMins > prevWait.current) isWorseChange = true;
        }
        if (prevWalk.current !== undefined && item.walkTimeMins !== undefined && prevWalk.current !== item.walkTimeMins) {
            changed = true;
            if (item.walkTimeMins > prevWalk.current) isWorseChange = true;
        }

        if (changed) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFlashColor(isWorseChange ? 'bg-red-100/50 dark:bg-red-900/30' : 'bg-green-100/50 dark:bg-green-900/30');
            const t = setTimeout(() => setFlashColor(null), 1000);
            prevWait.current = item.expectedWaitMins;
            prevWalk.current = item.walkTimeMins;
            return () => clearTimeout(t);
        }
        prevWait.current = item.expectedWaitMins;
        prevWalk.current = item.walkTimeMins;
    }, [item.expectedWaitMins, item.walkTimeMins]);

    if (!ride && item.rideId !== 'custom-break') return null;

    const delta = ride ? getWaitTimeDelta(ride) : null;
    const isBetter = delta !== null && delta < -5;
    const isWorse = delta !== null && delta > 5;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative transition-all",
                isDragging && "shadow-xl opacity-90 scale-[1.02] z-50",
                item.completed && "opacity-60 grayscale-[0.5]",
            )}
        >
            {/* Walk time connector pill (only show if there is walk time and we are not dragging) */}
            {!isDragging && item.walkTimeMins !== undefined && item.walkTimeMins > 0 && (
                <div className="flex justify-center -mb-3 relative z-20 pointer-events-none">
                    <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <PersonStanding className="w-3 h-3" />
                        {item.walkTimeMins}m walk
                    </div>
                </div>
            )}

            <div className={cn(
                "flex gap-3 p-3 sm:p-4 bg-white dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-700/50 transition-colors duration-700",
                flashColor,
                isFirstIncomplete && "is-first-incomplete ring-inset ring-2 ring-blue-500/10 bg-blue-50/10"
            )}>
                <div className="relative flex flex-col items-center w-6 z-10 pt-1">
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-600 transition-colors focus:outline-none p-0.5 rounded touch-none mb-1"
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onToggle(item.id)}
                        className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors bg-white dark:bg-zinc-800 relative z-10",
                            item.completed 
                                ? "bg-green-500 border-green-500 text-white dark:bg-green-500" 
                                : "border-zinc-300 dark:border-zinc-600 hover:border-blue-400 dark:hover:border-blue-500"
                        )}
                    >
                        {item.completed && <Check className="w-3 h-3" />}
                    </button>
                </div>

                <div className="flex-1 min-w-0 flex flex-col pt-0.5">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <p className={cn("font-bold text-zinc-900 dark:text-zinc-100 truncate", item.completed && "line-through text-zinc-500 dark:text-zinc-400")}>
                            {item.rideId === 'custom-break' ? item.customName : ride?.name}
                        </p>
                    </div>
                    
                    <button
                        onClick={() => onRemove(item.id)}
                        className="p-1.5 -mt-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="flex flex-col gap-1 mt-1">
                    {item.rideId === 'custom-break' ? (
                        <div className="text-[11px] sm:text-xs text-zinc-400 font-medium">
                            Duration: {item.expectedWaitMins} mins
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                            {item.expectedWaitMins !== undefined && (
                                <div className="flex items-center gap-1">
                                    <Clock className={cn("w-3.5 h-3.5", getWaitColorText(item.expectedWaitMins))} />
                                    <div className="flex items-center gap-1.5">
                                        {(item.status === 'DOWN' || item.status === 'CLOSED') ? (
                                            <span className="font-bold text-rose-500 uppercase tracking-wider text-[11px]">
                                                {item.status}
                                            </span>
                                        ) : (
                                            <>
                                                <span className={cn("font-bold", getWaitColorText(item.expectedWaitMins))}>
                                                    {item.expectedWaitMins}m {item.isForecast ? 'forecast' : 'live'}
                                                </span>
                                                {item.isForecast && item.liveWaitMins !== undefined && (
                                                    <span className={cn("font-normal text-[10px] hidden sm:inline", getWaitColorText(item.liveWaitMins))}>
                                                        (Live: {item.liveWaitMins}m)
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                            {delta !== null && delta !== 0 && !item.completed && (
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-black tracking-tight ml-auto sm:ml-0",
                                    isBetter ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                    isWorse ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                    "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                                )}>
                                    {delta > 0 ? '+' : ''}{delta}m vs Avg
                                </span>
                            )}
                        </div>
                    )}
                    {item.arrivalTimeMs !== undefined && (
                        <div className="text-[11px] sm:text-xs text-zinc-400 font-medium">
                            Arrive {new Date(item.arrivalTimeMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            {item.departureTimeMs && ` • Done ${new Date(item.departureTimeMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}
                        </div>
                    )}
                </div>
                </div>
            </div>
        </div>
    );
}

// --- Main Itinerary Component ---
export function RopeDropItinerary({ rides, resort }: { rides: Ride[], resort: ResortId }) {
    const { 
        itinerary, 
        isLoaded, 
        addItem,
        addCustomBreak,
        removeItem, 
        toggleComplete,
        reorderItems,
        simulationStartTime,
        setSimulationTime,
        savedStrategies,
        saveCurrentStrategy,
        loadStrategy,
        deleteStrategy,
        clearItinerary,
        setItineraryItems
    } = useItinerary(resort);

    const [currentTime, setCurrentTime] = useState(() => Date.now());

    // Update current time every minute for live timelines
    useEffect(() => {
        if (simulationStartTime) return;
        const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
        return () => clearInterval(timer);
    }, [simulationStartTime]);

    const loadPreset = (presetType: string) => {
        let presetNames: string[] = [];
        if (presetType === 'DL_Fantasyland') {
            presetNames = ["Peter Pan's Flight", "Alice in Wonderland", "Mr. Toad's Wild Ride", "Matterhorn Bobsleds", "Space Mountain"];
        } else if (presetType === 'DL_Thrill') {
            presetNames = ["Space Mountain", "Matterhorn Bobsleds", "Indiana Jones™ Adventure", "Big Thunder Mountain Railroad"];
        } else if (presetType === 'DCA_Radiator') {
            presetNames = ["Radiator Springs Racers", "Toy Story Midway Mania!", "Incredicoaster"];
        } else if (presetType === 'DCA_Guardians') {
            presetNames = ["Guardians of the Galaxy – Mission: BREAKOUT!", "WEB SLINGERS: A Spider-Man Adventure", "Incredicoaster"];
        } else if (presetType === 'WDW_MK_Fantasyland') {
            presetNames = ["Seven Dwarfs Mine Train", "Peter Pan's Flight", "Space Mountain", "Big Thunder Mountain Railroad"];
        } else if (presetType === 'WDW_HS_StarWars') {
            presetNames = ["Star Wars: Rise of the Resistance", "Slinky Dog Dash", "The Twilight Zone™ Tower of Terror"];
        } else if (presetType === 'WDW_EPCOT_WorldDiscovery') {
            presetNames = ["Remy's Ratatouille Adventure", "Frozen Ever After", "Test Track"];
        } else if (presetType === 'WDW_AK_Pandora') {
            presetNames = ["Avatar Flight of Passage", "Expedition Everest - Legend of the Forbidden Mountain", "Kilimanjaro Safaris"];
        }
        
        const newItems: ItineraryItem[] = [];
        presetNames.forEach(name => {
            const ride = rides.find(r => r.name === name);
            if (ride) {
                newItems.push({
                    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
                    rideId: ride.id,
                    completed: false
                });
            }
        });
        if (newItems.length > 0) setItineraryItems(newItems);
        setShowSavesMenu(false);
    };
    
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [showSavesMenu, setShowSavesMenu] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        if (isLoaded) {
            setTimeout(() => {
                const firstIncomplete = document.querySelector('.is-first-incomplete');
                if (firstIncomplete) {
                    firstIncomplete.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }, [isLoaded]);

    if (!isLoaded) return <div className="p-8 text-center text-zinc-500 animate-pulse">Loading itinerary...</div>;

    // Filter rides for search dropdown
    const availableRides = rides
        .filter(r => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            const land = getLand(r.name, resort, r.id);
            return r.name.toLowerCase().includes(q) || (land && land.toLowerCase().includes(q));
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isSearching) return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIndex(prev => Math.min(prev + 1, Math.min(availableRides.length, 20)));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (focusedIndex === 0) {
                const name = prompt("Name of break/meal:");
                if (!name) return;
                const duration = parseInt(prompt("Duration in minutes:") || "30", 10);
                if (!isNaN(duration)) {
                    addCustomBreak(name, duration);
                }
                setIsSearching(false);
                setSearchQuery("");
                setFocusedIndex(-1);
            } else if (focusedIndex > 0) {
                const ride = availableRides[focusedIndex - 1];
                if (ride) {
                    addItem(ride.id);
                    setSearchQuery("");
                    setIsSearching(false);
                    setFocusedIndex(-1);
                }
            }
        } else if (e.key === 'Escape') {
            setIsSearching(false);
            setFocusedIndex(-1);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = itinerary.findIndex(i => i.id === active.id);
            const newIndex = itinerary.findIndex(i => i.id === over.id);
            reorderItems(oldIndex, newIndex);
        }
    };

    // Timeline Math Engine
    const firstIncompleteIndex = itinerary.findIndex(i => !i.completed);
    const timeline = itinerary.reduce<{ items: AugmentedItineraryItem[]; runningTimeMs: number; previousRideId: string | null }>((state, item, index) => {
        const runningTimeMs = !simulationStartTime && index === firstIncompleteIndex
            ? currentTime
            : state.runningTimeMs;
        const previousRideId = state.previousRideId;
        if (item.rideId === 'custom-break') {
            const duration = item.customDuration || 0;
            const arrivalTimeMs = runningTimeMs;
            const departureTimeMs = arrivalTimeMs + (duration * 60000);
            return {
                items: [...state.items, {
                    ...item,
                walkTimeMins: 0,
                arrivalTimeMs,
                expectedWaitMins: duration,
                departureTimeMs,
                isForecast: false,
                liveWaitMins: 0
                }],
                runningTimeMs: departureTimeMs,
                previousRideId,
            };
        }

        const ride = rides.find(r => r.id === item.rideId);
        
        // If live mode and completed, don't project future times. Just show it happened.
        if (!simulationStartTime && item.completed) {
            return {
                items: [...state.items, { ...item, walkTimeMins: 0, arrivalTimeMs: item.completedAt, expectedWaitMins: undefined, departureTimeMs: item.completedAt }],
                runningTimeMs,
                previousRideId: item.rideId,
            };
        }

        let walkTimeMins = 0;
        if (previousRideId && ride) {
            const prevCoords = RIDE_COORDS[previousRideId];
            const currCoords = RIDE_COORDS[ride.id];
            if (prevCoords && currCoords) {
                const dist = calculateDistance(prevCoords.lat, prevCoords.lng, currCoords.lat, currCoords.lng);
                walkTimeMins = estimateWalkTimeMinutes(dist);
            }
        }
        
        const arrivalTimeMs = runningTimeMs + (walkTimeMins * 60000);
        
        // Wait time calculation
        let expectedWaitMins = 15;
        let isForecast = false;
        const liveWaitMins = ride?.queue?.STANDBY?.waitTime ?? 0;

        if (ride) {
            if (!simulationStartTime && index === firstIncompleteIndex) {
                expectedWaitMins = liveWaitMins;
            } else if (ride.forecast) {
                const timeZone = resort === 'WDW' ? 'America/New_York' : 'America/Los_Angeles';
                const hourFormatter = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hourCycle: 'h23' });
                const arrivalHour = hourFormatter.format(new Date(arrivalTimeMs));
                const forecastMatch = ride.forecast.find(f => hourFormatter.format(new Date(f.time)) === arrivalHour);
                if (forecastMatch) {
                    expectedWaitMins = forecastMatch.waitTime;
                    isForecast = true;
                } else {
                    expectedWaitMins = liveWaitMins;
                }
            } else {
                expectedWaitMins = liveWaitMins;
            }
        }
        
        const rideDurationMins = 5; 
        const departureTimeMs = arrivalTimeMs + (expectedWaitMins * 60000) + (rideDurationMins * 60000);
        
        return {
            items: [...state.items, {
                ...item,
            walkTimeMins,
            arrivalTimeMs,
            expectedWaitMins,
            departureTimeMs,
            isForecast,
            liveWaitMins,
            status: ride?.status
            }],
            runningTimeMs: departureTimeMs,
            previousRideId: item.rideId,
        };
    }, { items: [], runningTimeMs: simulationStartTime || currentTime, previousRideId: null });
    const augmentedItems = timeline.items;

    const totalWait = augmentedItems.reduce((acc, item) => acc + (!item.completed && item.rideId !== 'custom-break' ? (item.expectedWaitMins || 0) : 0), 0);
    const totalWalk = augmentedItems.reduce((acc, item) => acc + (!item.completed ? (item.walkTimeMins || 0) : 0), 0);
    const totalDelta = augmentedItems.reduce((acc, item) => {
        if (item.completed || item.rideId === 'custom-break') return acc;
        const r = rides.find(ride => ride.id === item.rideId);
        return acc + (r ? (getWaitTimeDelta(r) || 0) : 0);
    }, 0);

    const estCompletionMs = augmentedItems.length > 0 ? augmentedItems[augmentedItems.length - 1].departureTimeMs : null;



    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <RouteIcon className="w-5 h-5 text-blue-500" />
                            Rope Drop Strategy
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-zinc-500">Plan your morning route</p>
                            <button onClick={() => setShowSavesMenu(!showSavesMenu)} className="text-xs text-blue-500 hover:underline">
                                {showSavesMenu ? "Close Saves" : "Saved Strategies"}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearItinerary}
                            className="text-xs px-2.5 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <Trash className="w-4 h-4" />
                        </button>
                        <div className="flex p-0.5 bg-zinc-200 dark:bg-zinc-800/80 rounded-lg border border-zinc-300/50 dark:border-zinc-700">
                            <button 
                                onClick={() => setSimulationTime(null)}
                                className={cn("px-3 py-1.5 text-xs font-bold rounded-md transition-all shadow-sm", !simulationStartTime ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 ring-1 ring-zinc-200 dark:ring-zinc-600" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300")}
                            >
                                Live Mode
                            </button>
                            <div className={cn("flex items-center px-1 rounded-md transition-all shadow-sm", simulationStartTime ? "bg-white dark:bg-zinc-700 ring-1 ring-zinc-200 dark:ring-zinc-600" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300")}>
                                <button 
                                    onClick={() => {
                                        if (!simulationStartTime) {
                                            const d = new Date();
                                            d.setDate(d.getDate() + 1);
                                            d.setHours(8, 0, 0, 0);
                                            setSimulationTime(d.getTime());
                                        }
                                    }}
                                    className={cn("px-2 py-1.5 text-xs font-bold transition-colors", simulationStartTime ? "text-purple-600 dark:text-purple-400" : "text-zinc-500")}
                                >
                                    Plan
                                </button>
                                {simulationStartTime && (
                                    <input 
                                        type="time" 
                                        title="Security Arrival Time"
                                        className="text-[10px] bg-transparent outline-none text-zinc-500 font-medium px-1 cursor-pointer w-[65px]"
                                        value={new Date(simulationStartTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                const [h, m] = e.target.value.split(':');
                                                const d = new Date(simulationStartTime);
                                                d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
                                                setSimulationTime(d.getTime());
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                {augmentedItems.length > 0 && (
                    <div className="flex items-center gap-4 py-2 px-3 bg-white dark:bg-zinc-800 rounded-lg border dark:border-zinc-700 shadow-sm text-sm">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Total Wait</span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{totalWait}m</span>
                        </div>
                        <div className="w-[1px] h-6 bg-zinc-200 dark:bg-zinc-700" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Total Walk</span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{totalWalk}m</span>
                        </div>
                        <div className="w-[1px] h-6 bg-zinc-200 dark:bg-zinc-700" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Vs Average</span>
                            <span className={cn("font-bold", totalDelta < 0 ? "text-green-500" : totalDelta > 0 ? "text-red-500" : "text-zinc-500")}>
                                {totalDelta > 0 ? '+' : ''}{totalDelta}m
                            </span>
                        </div>
                        <div className="w-[1px] h-6 bg-zinc-200 dark:bg-zinc-700" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Est Completion</span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                {estCompletionMs ? new Date(estCompletionMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '--:--'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Saves Menu */}
                {showSavesMenu && (
                    <div className="p-3 bg-white dark:bg-zinc-800 rounded-lg border dark:border-zinc-700 shadow-sm mt-1">
                        
                        {/* Expert Presets */}
                        <div className="mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Expert Presets</span>
                            <div className="grid grid-cols-2 gap-2">
                                {resort === 'DLR' ? (
                                    <>
                                        <button onClick={() => loadPreset('DL_Fantasyland')} className="text-xs p-2 bg-zinc-50 dark:bg-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded border border-zinc-200 dark:border-zinc-600 font-medium text-left">DL: Fantasyland</button>
                                        <button onClick={() => loadPreset('DL_Thrill')} className="text-xs p-2 bg-zinc-50 dark:bg-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded border border-zinc-200 dark:border-zinc-600 font-medium text-left">DL: E-Ticket Thrills</button>
                                        <button onClick={() => loadPreset('DCA_Radiator')} className="text-xs p-2 bg-zinc-50 dark:bg-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded border border-zinc-200 dark:border-zinc-600 font-medium text-left">DCA: Radiator Springs</button>
                                        <button onClick={() => loadPreset('DCA_Guardians')} className="text-xs p-2 bg-zinc-50 dark:bg-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded border border-zinc-200 dark:border-zinc-600 font-medium text-left">DCA: Avengers Campus</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => loadPreset('WDW_MK_Fantasyland')} className="text-xs p-2 bg-zinc-50 dark:bg-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded border border-zinc-200 dark:border-zinc-600 font-medium text-left">MK: Fantasyland Dash</button>
                                        <button onClick={() => loadPreset('WDW_HS_StarWars')} className="text-xs p-2 bg-zinc-50 dark:bg-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded border border-zinc-200 dark:border-zinc-600 font-medium text-left">HS: Galaxy & Thrills</button>
                                        <button onClick={() => loadPreset('WDW_EPCOT_WorldDiscovery')} className="text-xs p-2 bg-zinc-50 dark:bg-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded border border-zinc-200 dark:border-zinc-600 font-medium text-left">EPCOT: Global Dash</button>
                                        <button onClick={() => loadPreset('WDW_AK_Pandora')} className="text-xs p-2 bg-zinc-50 dark:bg-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded border border-zinc-200 dark:border-zinc-600 font-medium text-left">AK: Pandora Rope Drop</button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="w-full h-px bg-zinc-200 dark:bg-zinc-700 mb-3" />

                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Your Saves</span>
                            <button 
                                onClick={() => {
                                    const name = prompt("Name this strategy:");
                                    if (name) saveCurrentStrategy(name);
                                }}
                                className="text-xs flex items-center gap-1 text-blue-500 font-medium hover:underline"
                            >
                                <Save className="w-3 h-3" /> Save Current
                            </button>
                        </div>
                        {savedStrategies.length === 0 ? (
                            <p className="text-xs text-zinc-400 py-2">No saved strategies yet.</p>
                        ) : (
                            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                                {savedStrategies.map(s => (
                                    <div key={s.id} className="flex items-center justify-between p-2 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 rounded-md group">
                                        <button onClick={() => loadStrategy(s.id)} className="flex items-center gap-2 text-sm text-left flex-1 font-medium">
                                            <FolderOpen className="w-3 h-3 text-zinc-400" />
                                            {s.name} <span className="text-[10px] text-zinc-500 font-normal">({s.items.length} rides)</span>
                                        </button>
                                        <button onClick={() => deleteStrategy(s.id)} className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Itinerary List */}
            <div className="flex-1 overflow-y-auto bg-zinc-50/30 dark:bg-zinc-900/30 relative">
                {itinerary.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
                        <MapPin className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-medium text-zinc-600 dark:text-zinc-300">Your itinerary is empty</p>
                        <p className="text-sm mt-1">Search and add rides below to build your path.</p>
                    </div>
                ) : (
                    <div className="pb-24">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={itinerary.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                {augmentedItems.map((item, index) => (
                                    <SortableItineraryRow
                                        key={item.id}
                                        item={item}
                                        ride={rides.find(r => r.id === item.rideId)}
                                        onToggle={toggleComplete}
                                        onRemove={removeItem}
                                        isFirstIncomplete={index === firstIncompleteIndex}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>


                    </div>
                )}
            </div>

            {/* Search and Add Bottom Bar */}
            <div className="p-3 sm:p-4 border-t dark:border-zinc-800 bg-white dark:bg-zinc-900 relative z-20">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search to add a ride..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsSearching(true);
                            setFocusedIndex(-1);
                        }}
                        onFocus={() => setIsSearching(true)}
                        onKeyDown={handleKeyDown}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    
                    {/* Autocomplete Dropdown */}
                    {isSearching && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsSearching(false)} />
                            <div className="absolute bottom-full left-0 right-0 mb-2 max-h-64 overflow-y-auto bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-xl shadow-2xl z-50">
                                <div className="p-2 border-b dark:border-zinc-700/50 sticky top-0 bg-white dark:bg-zinc-800 z-10">
                                    <button
                                        onClick={() => {
                                            const name = prompt("Name of break/meal:");
                                            if (!name) return;
                                            const duration = parseInt(prompt("Duration in minutes:") || "30", 10);
                                            if (!isNaN(duration)) {
                                                addCustomBreak(name, duration);
                                            }
                                            setIsSearching(false);
                                            setFocusedIndex(-1);
                                        }}
                                        className={cn(
                                            "w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center justify-between text-sm font-bold",
                                            focusedIndex === 0 
                                                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" 
                                                : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                        )}
                                    >
                                        Add Custom Break/Meal
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                {availableRides.length === 0 ? (
                                    <div className="p-4 text-center text-zinc-500 text-sm">No rides found</div>
                                ) : (
                                    availableRides.slice(0, 20).map((ride, idx) => (
                                        <button
                                            key={ride.id}
                                            onClick={() => {
                                                addItem(ride.id);
                                                setSearchQuery("");
                                                setIsSearching(false);
                                                setFocusedIndex(-1);
                                            }}
                                            className={cn(
                                                "w-full text-left px-4 py-3 flex items-center justify-between border-b last:border-b-0 dark:border-zinc-700/50 transition-colors",
                                                focusedIndex === idx + 1 
                                                    ? "bg-zinc-100 dark:bg-zinc-700" 
                                                    : "hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                                            )}
                                        >
                                            <div>
                                                <div className="font-medium text-sm">{ride.name}</div>
                                                <div className="text-xs text-zinc-500">{ride.status === 'OPERATING' ? `${ride.queue?.STANDBY?.waitTime ?? 0}m wait` : ride.status}</div>
                                            </div>
                                            <Plus className="w-4 h-4 text-blue-500" />
                                        </button>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
