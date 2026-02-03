"use client";

import {
    LineChart,
    Line,
    YAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { Forecast } from "@/lib/types";
import { format } from "date-fns";

interface WaitTimeSparklineProps {
    forecast: Forecast[];
}

export function WaitTimeSparkline({ forecast }: WaitTimeSparklineProps) {
    if (!forecast || forecast.length === 0) return <div className="text-xs text-gray-400">No Data</div>;

    return (
        <div className="h-[40px] w-[120px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecast}>
                    <YAxis domain={[0, 'auto']} hide />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-black/80 text-white text-xs p-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-50">
                                        <p className="font-semibold">{format(new Date(data.time), "h a")}: {data.waitTime} min</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="waitTime"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
