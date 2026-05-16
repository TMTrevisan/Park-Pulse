"use client";

import { useMemo, useState, useEffect } from 'react';
import { WaitTimeSnapshot } from '@/lib/types';
import { format, eachDayOfInterval, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { ResortId } from '@/lib/parks';

interface RideHeatmapProps {
    rideId: string;
    history: WaitTimeSnapshot[];
    resort?: ResortId;
}

export function RideHeatmap({ rideId, history, resort = 'DLR' }: RideHeatmapProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const tz = resort === 'WDW' ? 'America/New_York' : 'America/Los_Angeles';

    const days = useMemo(() => {
        const end = new Date();
        const start = subDays(end, 6);
        return eachDayOfInterval({ start, end });
    }, []);

    const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

    const data = useMemo(() => {
        const grid: Record<string, Record<number, number[]>> = {};

        const dateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
        const hourFormatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' });

        days.forEach(day => {
            // Using local format for initialization since `days` is generated based on current time
            const dateStr = format(day, 'yyyy-MM-dd');
            grid[dateStr] = {};
            hours.forEach(hour => {
                grid[dateStr][hour] = [];
            });
        });

        history.forEach(snapshot => {
            const date = new Date(snapshot.timestamp);
            const dateStr = dateFormatter.format(date);
            const hour = parseInt(hourFormatter.format(date), 10);

            if (grid[dateStr] && grid[dateStr][hour] !== undefined) {
                const park = snapshot.parks.find(p => p.liveData.some(r => r.id === rideId));
                if (park) {
                    const ride = park.liveData.find(r => r.id === rideId);
                    if (ride?.queue?.STANDBY?.waitTime !== undefined) {
                        grid[dateStr][hour].push(ride.queue.STANDBY.waitTime);
                    }
                }
            }
        });

        // Calculate averages
        const processed: Record<string, Record<number, number | null>> = {};
        Object.entries(grid).forEach(([date, hoursData]) => {
            processed[date] = {};
            Object.entries(hoursData).forEach(([hour, values]) => {
                if (values.length > 0) {
                    processed[date][parseInt(hour)] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
                } else {
                    processed[date][parseInt(hour)] = null;
                }
            });
        });

        return processed;
    }, [rideId, history, days, hours]);

    const getColor = (wait: number | null) => {
        if (wait === null) return "bg-gray-100 dark:bg-zinc-800";
        if (wait <= 15) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
        if (wait <= 35) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
        if (wait <= 60) return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
    };

    if (!mounted) {
        return <div className="mt-6 h-64 w-full animate-pulse bg-zinc-100 dark:bg-zinc-800/50 rounded-xl"></div>;
    }

    return (
        <div className="mt-6">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                7-Day Wait Time Heatmap
            </h4>
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[600px]">
                    <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-2">
                        {/* Header */}
                        <div></div>
                        {days.map(day => (
                            <div key={day.toISOString()} className="text-[10px] font-bold text-gray-400 uppercase text-center">
                                {format(day, 'EEE')}
                                <div className="text-gray-600 dark:text-gray-300">{format(day, 'MMM d')}</div>
                            </div>
                        ))}

                        {/* Rows */}
                        {hours.map(hour => (
                            <>
                                <div key={`hour-${hour}`} className="text-[10px] font-medium text-gray-500 flex items-center justify-end pr-2">
                                    {format(new Date().setHours(hour), 'ha')}
                                </div>
                                {days.map(day => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const wait = data[dateStr]?.[hour];
                                    return (
                                        <div
                                            key={`${dateStr}-${hour}`}
                                            className={cn(
                                                "h-8 rounded-md flex items-center justify-center text-[10px] font-medium transition-all group relative",
                                                getColor(wait)
                                            )}
                                        >
                                            {wait !== null ? wait : '-'}
                                            {wait !== null && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                                    <div className="bg-zinc-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                                                        Avg: {wait} min
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="mt-4 flex items-center gap-4 text-[10px]">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900/40 border"></div>
                    <span className="text-gray-500">Walk-on</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900/40 border"></div>
                    <span className="text-gray-500">Moderate</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-orange-100 dark:bg-orange-900/40 border"></div>
                    <span className="text-gray-500">Busy</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-rose-100 dark:bg-rose-900/40 border"></div>
                    <span className="text-gray-500">Very Busy</span>
                </div>
            </div>
        </div>
    );
}
