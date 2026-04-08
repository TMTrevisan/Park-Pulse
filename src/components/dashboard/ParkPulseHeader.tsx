"use client";

import { cn } from "@/lib/utils";
import { PARKS, PARK_NAMES, RESORT_PARKS, RESORTS } from "@/lib/parks";
import type { ResortId } from "@/lib/parks";

export interface ParkStats {
    averageWait: number;
    busyness: {
        label: string;
        color: string;
        bg: string;
    };
}

interface ParkPulseHeaderProps {
    parkStats: Record<string, ParkStats>;
    selectedParkId: string;
    onParkSelect: (id: string) => void;
    resort: ResortId;
    onResortChange: (resort: ResortId) => void;
}

export function ParkPulseHeader({
    parkStats,
    selectedParkId,
    onParkSelect,
    resort,
    onResortChange,
}: ParkPulseHeaderProps) {
    const parkIds = RESORT_PARKS[resort];

    return (
        <header className="mb-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent italic">
                        PARK PULSE
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium tracking-wide uppercase mt-1">
                        {RESORTS[resort].name} · Real-Time Analytics
                    </p>
                </div>

                {/* Resort Toggle */}
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1 self-start md:self-auto shadow-sm">
                    {(Object.keys(RESORTS) as ResortId[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => onResortChange(r)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300",
                                resort === r
                                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-md ring-1 ring-zinc-200 dark:ring-zinc-700"
                                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                            )}
                        >
                            {r === 'DLR' ? '🏰 Disneyland' : '🌍 Disney World'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Park Cards */}
            <div className={cn(
                "grid gap-4 mt-2",
                parkIds.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
            )}>
                {parkIds.map((parkId) => {
                    const stats = parkStats[parkId] ?? {
                        averageWait: 0,
                        busyness: { label: 'Loading', color: 'text-zinc-400', bg: 'bg-zinc-400' }
                    };
                    const isSelected = selectedParkId === parkId;
                    const name = parkId === PARKS.DISNEYLAND_PARK ? 'Disneyland' :
                                 parkId === PARKS.DISNEY_CALIFORNIA_ADVENTURE ? 'California Adventure' :
                                 PARK_NAMES[parkId] || 'Unknown';

                    return (
                        <div
                            key={parkId}
                            onClick={() => onParkSelect(parkId)}
                            className={cn(
                                "relative p-5 rounded-[2rem] border transition-all duration-500 cursor-pointer h-full min-h-[140px] flex flex-col justify-between group",
                                isSelected
                                    ? "bg-white dark:bg-zinc-900 border-blue-500 shadow-[0_20px_50px_rgba(59,130,246,0.15)] scale-[1.03] z-10"
                                    : "bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100 hover:scale-[1.01]"
                            )}
                        >
                            {/* Selection Marker (Top-Right) */}
                            <div className={cn(
                                "absolute top-5 right-5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                                isSelected 
                                    ? "border-blue-500 bg-blue-50/50" 
                                    : "border-zinc-200 dark:border-zinc-800 opacity-20"
                            )}>
                                {isSelected && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-in zoom-in duration-300" />
                                )}
                            </div>

                            <div className="flex-1 pr-8">
                                <h3 className={cn(
                                    "text-xs font-black tracking-widest uppercase leading-tight mb-3 transition-colors",
                                    isSelected ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 dark:text-zinc-500"
                                )}>
                                    {name}
                                </h3>

                                <div className="flex items-baseline gap-1.5">
                                    <span className={cn(
                                        "text-3xl font-black tabular-nums tracking-tighter leading-none",
                                        isSelected ? "text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-400"
                                    )}>
                                        {stats.averageWait}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase text-zinc-400">min</span>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3">
                                <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full transition-all duration-1000", stats.busyness.bg)}
                                        style={{ width: `${Math.min(100, (stats.averageWait / 60) * 100)}%` }}
                                    />
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-tighter",
                                    stats.busyness.color
                                )}>
                                    {stats.busyness.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </header>
    );
}
