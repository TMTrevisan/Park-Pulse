"use client";

import { useState } from "react";
import { Ride } from "@/lib/types";
import { useItinerary, ItineraryItem } from "@/hooks/useItinerary";
import { ResortId, getLand } from "@/lib/parks";
import { Search, Plus, GripVertical, Check, Trash2, Clock, Route as RouteIcon, MapPin, PersonStanding, Play, Trash, Save, FolderOpen } from "lucide-react";
import { cn, getWaitTimeDelta, calculateDistance, estimateWalkTimeMinutes } from "@/lib/utils";
import rideCoords from "@/lib/ride-coords.json";
import { useEffect } from "react";

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
    arrayMove,
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

// --- Draggable Itinerary Item Component ---
function SortableItineraryRow({ 
    item, 
    ride, 
    onToggle, 
    onRemove,
    isFirstIncomplete
}: { 
    item: ItineraryItem & { walkTimeMins?: number; arrivalTimeMs?: number; expectedWaitMins?: number; departureTimeMs?: number };
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

    if (!ride) return null;

    const delta = getWaitTimeDelta(ride);
    const isBetter = delta !== null && delta < -5;
    const isWorse = delta !== null && delta > 5;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative flex gap-3 p-3 sm:p-4 bg-white dark:bg-zinc-800 transition-all border-b border-zinc-100 dark:border-zinc-700/50",
                isDragging && "shadow-xl opacity-90 scale-[1.02] border-blue-200 dark:border-blue-900 z-50",
                item.completed && "opacity-60 bg-zinc-50 dark:bg-zinc-900/50",
                isFirstIncomplete && "is-first-incomplete ring-inset ring-2 ring-blue-500/10"
            )}
        >
            {/* The vertical timeline line connecting dots */}
            <div className="absolute left-[30px] sm:left-[34px] top-10 bottom-[-16px] w-[2px] bg-zinc-200 dark:bg-zinc-700 z-0 group-last:hidden" />
            
            <div className="flex flex-col items-center gap-2 z-10 pt-1">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-600 transition-colors focus:outline-none p-0.5 rounded touch-none"
                >
                    <GripVertical className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onToggle(item.id)}
                    className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors bg-white dark:bg-zinc-800",
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
                            {ride.name}
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
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        {item.expectedWaitMins !== undefined && (
                            <div className="flex items-center gap-1">
                                <Clock className={cn("w-3.5 h-3.5", getWaitColorText(item.expectedWaitMins))} />
                                <span className={cn("font-bold", getWaitColorText(item.expectedWaitMins))}>{item.expectedWaitMins}m wait</span>
                            </div>
                        )}
                        {item.walkTimeMins !== undefined && item.walkTimeMins > 0 && (
                            <div className="flex items-center gap-1 text-zinc-500">
                                <PersonStanding className="w-3.5 h-3.5" />
                                <span>{item.walkTimeMins}m walk</span>
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
                    {item.arrivalTimeMs !== undefined && (
                        <div className="text-[11px] sm:text-xs text-zinc-400 font-medium">
                            Arrive {new Date(item.arrivalTimeMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            {item.departureTimeMs && ` • Done ${new Date(item.departureTimeMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}
                        </div>
                    )}
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
        removeItem, 
        toggleComplete,
        reorderItems,
        simulationStartTime,
        setSimulationTime,
        savedStrategies,
        saveCurrentStrategy,
        loadStrategy,
        deleteStrategy,
        clearItinerary
    } = useItinerary(resort);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
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
            const q = searchQuery.toLowerCase();
            const land = getLand(r.name, resort, r.id);
            return r.name.toLowerCase().includes(q) || (land && land.toLowerCase().includes(q));
        })
        .sort((a, b) => a.name.localeCompare(b.name));

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
    let runningTimeMs = simulationStartTime || Date.now();
    let previousRideId: string | null = null;
    
    const augmentedItems = itinerary.map((item, index) => {
        const ride = rides.find(r => r.id === item.rideId);
        
        // If live mode and completed, don't project future times. Just show it happened.
        if (!simulationStartTime && item.completed) {
            previousRideId = item.rideId;
            return { ...item, walkTimeMins: 0, arrivalTimeMs: item.completedAt, expectedWaitMins: undefined, departureTimeMs: item.completedAt };
        }

        // Reset running time to NOW if we hit the first incomplete item in Live Mode
        if (!simulationStartTime && index === firstIncompleteIndex) {
            runningTimeMs = Date.now();
        }

        let walkTimeMins = 0;
        if (previousRideId && ride) {
            const prevCoords = (rideCoords as any)[previousRideId];
            const currCoords = (rideCoords as any)[ride.id];
            if (prevCoords && currCoords) {
                const dist = calculateDistance(prevCoords.lat, prevCoords.lng, currCoords.lat, currCoords.lng);
                walkTimeMins = estimateWalkTimeMinutes(dist);
            }
        }
        
        const arrivalTimeMs = runningTimeMs + (walkTimeMins * 60000);
        
        // Wait time calculation
        let expectedWaitMins = 15;
        if (ride) {
            if (!simulationStartTime && index === firstIncompleteIndex) {
                expectedWaitMins = ride.queue?.STANDBY?.waitTime ?? 15;
            } else if (ride.forecast) {
                const arrivalHour = new Date(arrivalTimeMs).getHours();
                const forecastMatch = ride.forecast.find(f => new Date(f.time).getHours() === arrivalHour);
                if (forecastMatch) {
                    expectedWaitMins = forecastMatch.waitTime;
                } else {
                    expectedWaitMins = ride.queue?.STANDBY?.waitTime ?? 15;
                }
            } else {
                expectedWaitMins = ride.queue?.STANDBY?.waitTime ?? 15;
            }
        }
        
        const rideDurationMins = 5; 
        const departureTimeMs = arrivalTimeMs + (expectedWaitMins * 60000) + (rideDurationMins * 60000);
        
        runningTimeMs = departureTimeMs;
        previousRideId = item.rideId;
        
        return {
            ...item,
            walkTimeMins,
            arrivalTimeMs,
            expectedWaitMins,
            departureTimeMs
        };
    });

    const totalWait = augmentedItems.reduce((acc, item) => acc + (!item.completed ? (item.expectedWaitMins || 0) : 0), 0);
    const totalWalk = augmentedItems.reduce((acc, item) => acc + (!item.completed ? (item.walkTimeMins || 0) : 0), 0);
    const totalDelta = augmentedItems.reduce((acc, item) => {
        if (item.completed) return acc;
        const r = rides.find(ride => ride.id === item.rideId);
        return acc + (r ? (getWaitTimeDelta(r) || 0) : 0);
    }, 0);

    const toggleSimulation = () => {
        if (simulationStartTime) {
            setSimulationTime(null);
        } else {
            // Set simulation to 8:00 AM tomorrow
            const d = new Date();
            d.setDate(d.getDate() + 1);
            d.setHours(8, 0, 0, 0);
            setSimulationTime(d.getTime());
        }
    };

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
                        <button
                            onClick={toggleSimulation}
                            className={cn(
                                "text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-colors border",
                                simulationStartTime 
                                    ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800" 
                                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                            )}
                        >
                            <Play className="w-3 h-3" />
                            {simulationStartTime ? "Plan Mode (8 AM)" : "Live Mode"}
                        </button>
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
                    </div>
                )}

                {/* Saves Menu */}
                {showSavesMenu && (
                    <div className="p-3 bg-white dark:bg-zinc-800 rounded-lg border dark:border-zinc-700 shadow-sm mt-1">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold uppercase text-zinc-500">Saved Strategies</span>
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
                        }}
                        onFocus={() => setIsSearching(true)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    
                    {/* Autocomplete Dropdown */}
                    {isSearching && searchQuery.length > 0 && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsSearching(false)} />
                            <div className="absolute bottom-full left-0 right-0 mb-2 max-h-64 overflow-y-auto bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-xl shadow-2xl z-50">
                                {availableRides.length === 0 ? (
                                    <div className="p-4 text-center text-zinc-500 text-sm">No rides found</div>
                                ) : (
                                    availableRides.slice(0, 20).map(ride => (
                                        <button
                                            key={ride.id}
                                            onClick={() => {
                                                addItem(ride.id);
                                                setSearchQuery("");
                                                setIsSearching(false);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 flex items-center justify-between border-b last:border-b-0 dark:border-zinc-700/50 transition-colors"
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
