"use client";

import { useEffect, useState } from "react";
import { getLand, getTicketClass, ResortId } from "@/lib/parks";

export default function DiagPage() {
    const [data, setData] = useState<any>(null);
    const [resort, setResort] = useState<ResortId>("DLR");

    useEffect(() => {
        const fetchRides = async () => {
            try {
                const parkId = resort === "DLR" ? "734f007b-9c24-4bb8-8c0c-87a505a5e55e" : "803a19da-360e-4375-927b-28f099684366";
                const res = await fetch(`/api/wait-times?parkId=${parkId}`);
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
            }
        };
        fetchRides();
    }, [resort]);

    if (!data) return <div>Loading...</div>;

    const rides = data.rides || [];

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
            {rides.map((r: any) => {
                const name = r.name;
                const land = getLand(name, resort);
                const ticket = getTicketClass(name, resort);
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
