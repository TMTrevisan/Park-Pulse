"use client";

import { useEffect, useState } from "react";
import { getLand, getTicketClass, ResortId } from "@/lib/parks";
import type { Ride } from "@/lib/types";

export default function DiagPage() {
    const [rides, setRides] = useState<Ride[] | null>(null);
    const [resort, setResort] = useState<ResortId>("DLR");

    useEffect(() => {
        const fetchRides = async () => {
            try {
                const res = await fetch(`/api/wait-times?resort=${resort}&history=false`);
                if (!res.ok) throw new Error("Failed to fetch live data");
                const json = await res.json();
                setRides(json.current.parks.flatMap((park: { liveData: Ride[] }) => park.liveData));
            } catch (err) {
                console.error(err);
                setRides([]);
            }
        };
        fetchRides();
    }, [resort]);

    if (!rides) return <div>Loading...</div>;

    return (
        <div className="p-8 font-mono text-xs">
            <h1 className="text-xl font-bold mb-4">Metadata Diagnostics</h1>
            <div className="flex gap-4 mb-8">
                <button onClick={() => setResort("DLR")} className={resort === "DLR" ? "text-blue-500 font-bold" : ""}>DLR</button>
                <button onClick={() => setResort("WDW")} className={resort === "WDW" ? "text-blue-500 font-bold" : ""}>WDW</button>
            </div>
            <div className="grid grid-cols-4 font-bold border-b pb-2 mb-2">
                <div>Original Name</div>
                <div>Sanitized</div>
                <div>Land Calc</div>
                <div>Ticket Calc</div>
            </div>
            {rides.map((r) => {
                const name = r.name;
                const land = getLand(name, resort, r.id);
                const ticket = getTicketClass(name, resort, r.id);
                return (
                    <div key={r.id} className="grid grid-cols-4 border-b py-1">
                        <div className="truncate pr-2">{name}</div>
                        <div className="text-gray-400 truncate">{name.toLowerCase()}</div>
                        <div className={land === '—' ? "text-red-500" : "text-green-600"}>{land}</div>
                        <div className={ticket === '—' ? "text-red-500" : "text-green-600"}>{ticket}</div>
                    </div>
                );
            })}
        </div>
    );
}
