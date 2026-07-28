"use client";

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import type { ResortId } from '@/lib/parks';

export type AnalyticsTimelinePoint = {
    time: string;
    [rideId: string]: string | number | null;
};

interface ComparativeTimelineProps {
    data: AnalyticsTimelinePoint[];
    ridesMeta: Record<string, { name: string, parkId: string }>;
    selectedRides: string[];
    colors: string[];
    resort: ResortId;
}

export function ComparativeTimeline({ data, ridesMeta, selectedRides, colors, resort }: ComparativeTimelineProps) {
    const formattedData = useMemo(() => {
        const timeZone = resort === 'WDW' ? 'America/New_York' : 'America/Los_Angeles';
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone,
            hour: 'numeric',
            minute: '2-digit',
        });
        return data.map(point => {
            const date = new Date(point.time);
            return {
                ...point,
                timeLabel: formatter.format(date)
            };
        });
    }, [data, resort]);

    const stats = useMemo(() => {
        // Calculate averages, max, min for EACH selected ride
        const results: Record<string, { avg: number, max: number, min: number }> = {};
        
        selectedRides.forEach(rideId => {
            const validWaits = data
                .map(d => d[rideId])
                .filter((wait): wait is number => typeof wait === 'number' && wait > 0);
            if (validWaits.length === 0) {
                results[rideId] = { avg: 0, max: 0, min: 0 };
                return;
            }
            const avg = Math.round(validWaits.reduce((a, b) => a + b, 0) / validWaits.length);
            const max = Math.max(...validWaits);
            const min = Math.min(...validWaits);
            results[rideId] = { avg, max, min };
        });

        return results;
    }, [data, selectedRides]);

    return (
        <div className="flex flex-col h-full space-y-8">
            {/* Multi-Line Chart */}
            <div className="flex-1 w-full min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
                        <XAxis 
                            dataKey="timeLabel" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#71717a' }}
                            dy={10}
                            minTickGap={50}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#71717a' }}
                            dx={-10}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                            itemStyle={{ fontWeight: 600 }}
                            labelStyle={{ color: '#71717a', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}
                        />
                        <Legend 
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        
                        {selectedRides.map((rideId, index) => (
                            <Line 
                                key={rideId}
                                type="monotone" 
                                dataKey={rideId} 
                                name={ridesMeta[rideId]?.name || "Unknown"}
                                stroke={colors[index % colors.length]} 
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, strokeWidth: 0, fill: colors[index % colors.length] }}
                                connectNulls
                                animationDuration={1000}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Aggregated Stats Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto max-h-[250px] layout-scrollbar pr-2">
                {selectedRides.map((rideId, index) => {
                    const rideStats = stats[rideId];
                    const color = colors[index % colors.length];
                    const meta = ridesMeta[rideId];
                    
                    if (!rideStats || rideStats.max === 0) return null;

                    return (
                        <div key={rideId} className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/50 flex flex-col gap-3 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                <span className="font-bold text-sm truncate" title={meta?.name}>{meta?.name}</span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Avg</span>
                                    <span className="text-lg font-black">{rideStats.avg} <span className="text-[10px] text-zinc-400">m</span></span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-red-500/70 font-bold uppercase flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Peak</span>
                                    <span className="text-lg font-black text-red-500">{rideStats.max} <span className="text-[10px] text-red-400/50">m</span></span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-emerald-500/70 font-bold uppercase flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Low</span>
                                    <span className="text-lg font-black text-emerald-500">{rideStats.min} <span className="text-[10px] text-emerald-400/50">m</span></span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
