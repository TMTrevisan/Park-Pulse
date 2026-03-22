"use client";

import { cn } from "@/lib/utils";
import { PARKS } from "@/lib/parks";
import { CheckCircle2 } from "lucide-react";

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
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4 mt-2">
                {parks.map((park) => (
                    <div 
                        key={park.id}
                        onClick={() => onParkSelect(park.id)}
                        className={cn(
                            "relative overflow-hidden group p-3 sm:p-5 rounded-3xl border transition-all duration-500 cursor-pointer",
                            selectedParkId === park.id 
                                ? "bg-white dark:bg-zinc-900/80 border-blue-500/40 shadow-xl shadow-blue-500/10 scale-[1.02] ring-1 ring-blue-500/20" 
                                : "bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100 hover:scale-[1.01] hover:bg-zinc-100 dark:hover:bg-zinc-800/40 grayscale-[0.5] hover:grayscale-0"
                        )}
                    >
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center items-start relative z-10 gap-3 lg:gap-0">
                            <div className="w-full">
                                <div className="flex justify-between items-start w-full mb-1">
                                    <h3 className="text-zinc-400 text-[10px] md:text-xs font-black uppercase tracking-wider md:tracking-widest">
                                        {park.name}
                                    </h3>
                                    <div className={cn(
                                        "w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ml-2",
                                        selectedParkId === park.id 
                                            ? "border-blue-500 bg-blue-500 text-white" 
                                            : "border-zinc-300 dark:border-zinc-700 bg-transparent"
                                    )}>
                                        {selectedParkId === park.id && <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 animate-in zoom-in" strokeWidth={3} />}
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-1 md:gap-2">
                                    <span className="text-2xl md:text-3xl font-black tabular-nums tracking-tighter text-zinc-800 dark:text-zinc-100">
                                        {park.stats.averageWait}
                                    </span>
                                    <span className="text-zinc-500 text-[9px] md:text-xs font-bold uppercase">min avg</span>
                                </div>
                            </div>

                            <div className={cn(
                                "px-2.5 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-sm border truncate max-w-full",
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
