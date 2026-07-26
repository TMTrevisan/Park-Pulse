"use client";

import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from "date-fns";
import { getCrowdCalendarDataForMonth, CrowdMetrics } from "@/lib/crowd-utils";
import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export function CrowdCalendarView() {
    const currentDate = useMemo(() => new Date(2026, 5, 1), []); // Mock data currently covers June 2026 only

    const metricsMap = useMemo(() => {
        const metricsList = getCrowdCalendarDataForMonth(currentDate.getFullYear(), currentDate.getMonth() + 1);
        const map: Record<string, CrowdMetrics> = {};
        metricsList.forEach(m => map[m.date] = m);
        return map;
    }, [currentDate]);

    const days = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    // Calculate padding days to align the calendar grid to Sunday
    const startDayOfWeek = getDay(days[0]);
    const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

    return (
        <div className="w-full max-w-7xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white/50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-white/20 dark:border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Disneyland Resort Crowd Forecast
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                    <button className="p-2 rounded-md hover:bg-white dark:hover:bg-zinc-700 transition-colors text-gray-400 cursor-not-allowed">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-4 py-2 text-sm font-medium">June 2026</div>
                    <button className="p-2 rounded-md hover:bg-white dark:hover:bg-zinc-700 transition-colors text-gray-400 cursor-not-allowed">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-[#121418] rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden">
                {/* Days of week header */}
                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-zinc-900/50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 auto-rows-fr">
                    {paddingDays.map(i => (
                        <div key={`pad-${i}`} className="min-h-[120px] p-2 border-r border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-900/20" />
                    ))}
                    
                    {days.map((day, idx) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const metrics = metricsMap[dateStr];
                        const today = isToday(day);

                        return (
                            <div 
                                key={dateStr}
                                className={cn(
                                    "min-h-[140px] p-3 flex flex-col gap-2 border-b border-r border-gray-100 dark:border-white/5 relative group transition-colors",
                                    idx % 7 === 6 ? "border-r-0" : "", // Remove right border for Saturday
                                    today ? "bg-blue-50/30 dark:bg-blue-900/10" : "hover:bg-gray-50 dark:hover:bg-zinc-900/30",
                                    metrics ? metrics.colorClass.replace('border', '') : ""
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                        today ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                    {metrics && (
                                        <span className={cn(
                                            "text-xs font-bold px-2 py-0.5 rounded-full border",
                                            metrics.colorClass
                                        )}>
                                            {metrics.severity}
                                        </span>
                                    )}
                                </div>

                                {metrics && (
                                    <div className="mt-auto space-y-2 flex-grow flex flex-col justify-end">
                                        <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                                            Ticket Tier: <strong className="text-gray-900 dark:text-white">{metrics.tier}</strong>
                                        </div>
                                        
                                        {metrics.blockouts.length > 0 && (
                                            <div className="text-[10px] bg-white/50 dark:bg-black/20 px-2 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-white/5">
                                                <span className="font-semibold text-rose-500 dark:text-rose-400 block mb-0.5">Blocked:</span>
                                                {metrics.blockouts.join(', ')}
                                            </div>
                                        )}

                                        {metrics.events.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {metrics.events.map(event => (
                                                    <span key={event} className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                                                        {event}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Low', class: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30', desc: 'Tier 0-2, Few blockouts' },
                    { label: 'Moderate', class: 'bg-amber-500/20 text-amber-600 border-amber-500/30', desc: 'Tier 3-4, Imagine blocked' },
                    { label: 'Heavy', class: 'bg-orange-500/20 text-orange-600 border-orange-500/30', desc: 'Tier 5, Enchant blocked' },
                    { label: 'Insane', class: 'bg-rose-500/20 text-rose-600 border-rose-500/30', desc: 'Tier 6, Believe blocked, Events' }
                ].map(item => (
                    <div key={item.label} className="p-4 rounded-2xl border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-[#121418] backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <div className={cn("w-3 h-3 rounded-full border", item.class)} />
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 pl-5">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
