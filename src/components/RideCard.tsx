import { LiveStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Clock, AlertCircle } from "lucide-react";

interface RideCardProps {
    ride: LiveStatus;
}

export function RideCard({ ride }: RideCardProps) {
    const isOperating = ride.status === "OPERATING";
    const waitTime = ride.queue?.STANDBY?.waitTime ?? 0;
    const statusColor = isOperating
        ? waitTime > 60
            ? "text-red-500"
            : waitTime > 30
                ? "text-yellow-500"
                : "text-green-500"
        : "text-gray-400";

    return (
        <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-zinc-800 dark:border-zinc-700 flex flex-col justify-between h-full">
            <div>
                <h3 className="font-semibold text-lg line-clamp-2">{ride.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{ride.entityType}</p>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className={cn("flex items-center gap-2", statusColor)}>
                    {isOperating ? (
                        <>
                            <Clock className="w-5 h-5" />
                            <span className="font-bold text-xl">{waitTime} min</span>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">{ride.status}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
