"use client";

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';

interface TimelinePoint {
    timestamp: string;
    waitTime: number;
}

interface WaitTimeTimelineProps {
    data: TimelinePoint[];
    currentWait: number;
    isOperating: boolean;
}

export function WaitTimeTimeline({ data, currentWait, isOperating }: WaitTimeTimelineProps) {
    const stats = useMemo(() => {
        if (!data || data.length === 0) return null;
        const waits = data.map(d => d.waitTime);
        const max = Math.max(...waits);
        const min = Math.min(...waits);
        const avg = Math.round(waits.reduce((a, b) => a + b, 0) / waits.length);
        
        let trend = "stable";
        if (waits.length >= 3) {
            const recent = waits.slice(-3); // Last ~45 mins
            if (currentWait > recent[0]) trend = "rising";
            else if (currentWait < recent[0]) trend = "falling";
        }

        return { max, min, avg, trend };
    }, [data, currentWait]);

    const formattedData = useMemo(() => {
        return data.map(point => {
            const date = new Date(point.timestamp);
            return {
                ...point,
                timeLabel: date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
            };
        });
    }, [data]);

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center h-[400px]">
                <Activity className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                <p className="text-zinc-500 font-medium">No historical data available for today yet.</p>
                <p className="text-zinc-400 text-sm mt-1">Wait times will populate as the park operates.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1">
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Daily Avg</span>
                    <span className="text-2xl font-black tabular-nums">{stats?.avg ?? '--'} <span className="text-sm font-bold text-zinc-400">MIN</span></span>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1">
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Daily Peak</span>
                    <span className="text-2xl font-black tabular-nums text-red-500">{stats?.max ?? '--'} <span className="text-sm font-bold text-red-400/50">MIN</span></span>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1">
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5" /> Daily Low</span>
                    <span className="text-2xl font-black tabular-nums text-green-500">{stats?.min ?? '--'} <span className="text-sm font-bold text-green-400/50">MIN</span></span>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1">
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Current Trend</span>
                    <span className="text-xl font-black uppercase tracking-wider mt-1.5">
                        {stats?.trend === 'rising' && <span className="text-orange-500">Rising</span>}
                        {stats?.trend === 'falling' && <span className="text-green-500">Falling</span>}
                        {stats?.trend === 'stable' && <span className="text-blue-500">Stable</span>}
                    </span>
                </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative">
                <h3 className="text-lg font-black tracking-tight mb-8">Wait Time History (Today)</h3>
                <div className="h-[300px] sm:h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={formattedData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
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
                            {stats?.avg && (
                                <ReferenceLine y={stats.avg} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'AVG', fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }} />
                            )}
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1f2937', borderRadius: '12px', border: '1px solid #374151', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', fontWeight: 'bold' }}
                                itemStyle={{ color: '#60a5fa', fontWeight: 900 }}
                                labelStyle={{ color: '#a1a1aa', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="waitTime" 
                                name="Wait Time"
                                stroke="#3b82f6" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorWait)" 
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
