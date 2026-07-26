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
import { ResortId } from "@/lib/parks";

interface WaitTimeChartProps {
    rideId: string;
    ride?: Ride;
    history: WaitTimeSnapshot[];
    resort?: ResortId;
}

function getOperatingDay(date: Date, timeZone: string) {
    const shiftedDate = new Date(date.getTime() - 4 * 60 * 60 * 1000);
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(shiftedDate);
}

export function WaitTimeChart({ rideId, ride, history, resort = 'DLR' }: WaitTimeChartProps) {
    const now = new Date();
    const tz = resort === 'WDW' ? 'America/New_York' : 'America/Los_Angeles';
    const currentOperatingDay = getOperatingDay(now, tz);
    const axisTimeFormatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric' });
    const tooltipTimeFormatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' });

    // 1. Process History Data
    const processedHistory = history.map((snapshot) => {
        let waitTime = null;
        for (const park of snapshot.parks) {
            const found = park.liveData.find((r) => r.id === rideId);
            if (found && found.queue?.STANDBY) {
                waitTime = found.queue.STANDBY.waitTime;
                break;
            }
        }
        return {
            time: new Date(snapshot.timestamp).getTime(),
            historyWait: waitTime,
        };
    }).filter(d => d.historyWait !== null && getOperatingDay(new Date(d.time), tz) === currentOperatingDay)
        .sort((a, b) => a.time - b.time);

    const historyData = processedHistory;

    // 2. Process Forecast Data
    const forecastData = (ride?.forecast || [])
        .filter((f: Forecast) => getOperatingDay(new Date(f.time), tz) === currentOperatingDay)
        .map((f: Forecast) => ({
            time: new Date(f.time).getTime(),
            forecastWait: f.waitTime
        }));

    // 3. Merge Data
    const combinedData = [
        ...historyData.map((d) => ({ ...d, type: 'history' })),
        ...forecastData.map((d) => ({ ...d, type: 'forecast' }))
    ].sort((a, b) => a.time - b.time);

    if (combinedData.length === 0) return <div className="text-center text-gray-400 py-8">No historic or forecast data available</div>;

    return (
        <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                        dataKey="time"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(time) => axisTimeFormatter.format(new Date(time))}
                        stroke="#888"
                        fontSize={12}
                        minTickGap={30}
                    />
                    <YAxis stroke="#888" fontSize={12} label={{ value: 'Min', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                        labelFormatter={(time) => tooltipTimeFormatter.format(new Date(time))}
                        contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", borderRadius: "8px", color: "#f3f4f6" }}
                        itemStyle={{ color: "#60a5fa" }}
                    />
                    <Legend />
                    <Line
                        name="Live Wait"
                        type="monotone"
                        dataKey="historyWait"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={false}
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
