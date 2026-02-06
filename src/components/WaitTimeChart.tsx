"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { WaitTimeSnapshot, Ride, Forecast } from "@/lib/types";
import { format, parseISO, isSameDay } from "date-fns";

interface WaitTimeChartProps {
    rideId: string;
    ride?: Ride;
    history: WaitTimeSnapshot[];
}

export function WaitTimeChart({ rideId, ride, history }: WaitTimeChartProps) {
    // 1. Process History Data
    const historyData = history.map((snapshot) => {
        let waitTime = null;
        for (const park of snapshot.parks) {
            const found = park.liveData.find((r) => r.id === rideId);
            if (found && found.queue?.STANDBY) {
                waitTime = found.queue.STANDBY.waitTime;
                break;
            }
        }
        return {
            time: new Date(snapshot.timestamp),
            historyWait: waitTime,
        };
    }).filter(d => d.historyWait !== null);

    // 2. Process Forecast Data
    const now = new Date();
    const forecastData = (ride?.forecast || []).map((f: Forecast) => ({
        time: new Date(f.time),
        forecastWait: f.waitTime
    })).filter((d: { time: Date; forecastWait: number }) => isSameDay(d.time, now));

    // 3. Merge Data
    const combinedData = [
        ...historyData.map((d) => ({ ...d, type: 'history' })),
        ...forecastData.map((d) => ({ ...d, type: 'forecast' }))
    ].sort((a, b) => a.time.getTime() - b.time.getTime());

    if (combinedData.length === 0) return <div className="text-center text-gray-400 py-8">No historic or forecast data available</div>;

    return (
        <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                        dataKey="time"
                        tickFormatter={(time) => format(time, "h a")}
                        stroke="#888"
                        fontSize={12}
                        minTickGap={30}
                    />
                    <YAxis stroke="#888" fontSize={12} label={{ value: 'Min', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                        labelFormatter={(time) => format(time, "h:mm a")}
                        contentStyle={{ borderRadius: "8px" }}
                    />
                    <Legend />
                    <Line
                        name="Live Wait"
                        type="monotone"
                        dataKey="historyWait"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={false}
                        connectNulls
                    />
                    <Line
                        name="Forecast (Avg)"
                        type="monotone"
                        dataKey="forecastWait"
                        stroke="#9ca3af"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
