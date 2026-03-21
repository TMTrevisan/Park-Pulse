"use client";

import { cn } from "@/lib/utils";
import { PARKS } from "@/lib/parks";

export interface ParkStats {
    averageWait: number;
    busyness: {
        label: string;
        color: string;
        bg: string;
    };
}

interface ParkPulseHeaderProps {
    disneyland: ParkStats;
    dca: ParkStats;
    selectedParkId: string;
    onParkSelect: (id: string) => void;
}

export function ParkPulseHeader({ disneyland, dca, selectedParkId, onParkSelect }: ParkPulseHeaderProps) {
    const parks = [
        { id: PARKS.DISNEYLAND_PARK, name: "Disneyland", stats: disneyland },
        { id: PARKS.DISNEY_CALIFORNIA_ADVENTURE, name: "California Adventure", stats: dca },
    ];

    return (
        <header className="mb-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent italic">
                        PARK PULSE
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium tracking-wide uppercase mt-1">
                        Disneyland Resort Multi-Park Analytics
                    </p>
                </div>

                <div className="flex items-center gap-3 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
                    {parks.map((park) => {
                        const isActive = selectedParkId === park.id;
                        return (
                            <button
                                key={park.id}
                                onClick={() => onParkSelect(park.id)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-3",
                                    isActive 
                                        ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-lg scale-[1.02]" 
                                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                )}
                            >
                                <span className={cn(
                                    "w-2 h-2 rounded-full animate-pulse",
                                    park.stats.busyness.bg
                                )} />
                                {park.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parks.map((park) => (
                    <div 
                        key={park.id}
                        className={cn(
                            "relative overflow-hidden group p-5 rounded-3xl border transition-all duration-500",
                            selectedParkId === park.id 
                                ? "bg-white dark:bg-zinc-900/50 border-blue-500/30 shadow-2xl shadow-blue-500/10" 
                                : "bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800 opacity-80"
                        )}
                    >
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <h3 className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-1">
                                    {park.name} Pulse
                                </h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black tabular-nums tracking-tighter">
                                        {park.stats.averageWait}
                                    </span>
                                    <span className="text-zinc-500 text-xs font-bold uppercase">min avg</span>
                                </div>
                            </div>

                            <div className={cn(
                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border",
                                park.stats.busyness.color,
                                "bg-white dark:bg-zinc-900 border-current/20"
                            )}>
                                {park.stats.busyness.label}
                            </div>
                        </div>

                        {/* Visual Pulse Bar */}
                        <div className="mt-4 h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                                className={cn("h-full transition-all duration-1000 ease-out", park.stats.busyness.bg.replace('animate-pulse', ''))} 
                                style={{ width: `${Math.min(100, (park.stats.averageWait / 60) * 100)}%` }}
                            />
                        </div>
                        
                        {/* Interactive Background Glow */}
                        <div className={cn(
                            "absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-20 transition-opacity duration-500",
                            park.stats.busyness.bg,
                            selectedParkId === park.id ? "opacity-30" : "opacity-5"
                        )} />
                    </div>
                ))}
            </div>
        </header>
    );
}
