"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { WaitTimeSnapshot } from "@/lib/types";
import { format } from "date-fns";

interface WaitTimeChartProps {
    rideId: string;
    history: WaitTimeSnapshot[];
}

export function WaitTimeChart({ rideId, history }: WaitTimeChartProps) {
    const data = history.map((snapshot) => {
        // Find the ride in either park data
        let waitTime = 0;
        for (const park of snapshot.parks) {
            const ride = park.liveData.find((r) => r.id === rideId);
            if (ride && ride.queue?.STANDBY) {
                waitTime = ride.queue.STANDBY.waitTime;
                break;
            }
        }

        return {
            time: new Date(snapshot.timestamp),
            waitTime,
        };
    });

    if (data.length === 0) return null;

    return (
        <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                        dataKey="time"
                        tickFormatter={(time) => format(time, "HH:mm")}
                        stroke="#888"
                        fontSize={12}
                    />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip
                        labelFormatter={(time) => format(time, "MMM d, HH:mm")}
                        contentStyle={{ borderRadius: "8px" }}
                    />
                    <Line
                        type="monotone"
                        dataKey="waitTime"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
