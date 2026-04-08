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
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1 self-start md:self-auto">
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
                "grid gap-3 md:gap-4 mt-2",
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
                                "relative overflow-hidden group p-4 sm:p-5 rounded-3xl border transition-all duration-500 cursor-pointer h-full min-h-[100px] flex flex-col justify-between",
                                isSelected
                                    ? "bg-white dark:bg-zinc-900 border-blue-500 shadow-xl shadow-blue-500/10 scale-[1.02] ring-1 ring-blue-500/20"
                                    : "bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100 hover:scale-[1.01] hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
                            )}
                        >
                            {/* Premium Selection Indicator */}
                            <div className={cn(
                                "absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                isSelected
                                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10"
                                    : "border-zinc-200 dark:border-zinc-800 opacity-20"
                            )}>
                                {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-in zoom-in duration-300 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                )}
                            </div>

                            <div className="relative z-10 w-full mb-3 pr-8">
                                <h3 className={cn(
                                    "text-[10px] md:text-xs font-black uppercase tracking-widest leading-tight whitespace-normal break-words mb-2 pr-2",
                                    isSelected ? "text-blue-600 dark:text-blue-400" : "text-zinc-500 dark:text-zinc-400"
                                )}>
                                    {name}
                                </h3>

                                <div className="flex items-baseline gap-1 md:gap-2">
                                    <span className={cn(
                                        "text-2xl md:text-3xl font-black tabular-nums tracking-tighter",
                                        isSelected ? "text-zinc-900 dark:text-white" : "text-zinc-700 dark:text-zinc-300"
                                    )}>
                                        {stats.averageWait}
                                    </span>
                                    <span className="text-zinc-500 text-[9px] md:text-xs font-bold uppercase">min avg</span>
                                </div>
                            </div>

                            <div className="relative z-10 w-full flex items-center justify-between gap-3 pt-2">
                                <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200/20 dark:border-zinc-700/20">
                                    <div
                                        className={cn("h-full transition-all duration-1000 ease-out", stats.busyness.bg)}
                                        style={{ width: `${Math.min(100, (stats.averageWait / 60) * 100)}%` }}
                                    />
                                </div>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-tighter shadow-sm border whitespace-nowrap bg-white dark:bg-zinc-900 border-current/20",
                                    stats.busyness.color
                                )}>
                                    {stats.busyness.label}
                                </div>
                            </div>

                            {/* Background glow for selected state */}
                            <div className={cn(
                                "absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-20 transition-opacity duration-500",
                                stats.busyness.bg,
                                isSelected ? "opacity-30" : "opacity-0"
                            )} />
                        </div>
                    );
                })}
            </div>
        </header>
    );
}
