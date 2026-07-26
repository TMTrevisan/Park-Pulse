import { getRideHistory, getRideDetails } from "@/lib/data-service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock, AlertCircle } from "lucide-react";
import { WaitTimeTimeline } from "@/components/charts/WaitTimeTimeline";
import { Metadata } from "next";
import type { ResortId } from "@/lib/parks";

function parseResort(resort: string | undefined): ResortId {
    return resort === "WDW" ? "WDW" : "DLR";
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ resort?: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { resort } = await searchParams;
    const details = await getRideDetails(id, parseResort(resort));
    return {
        title: details ? `${details.name} Wait Times | Park Pulse` : 'Ride Analytics',
    }
}

export default async function RidePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ resort?: string }> }) {
    const { id } = await params;
    const { resort: resortParam } = await searchParams;
    const resort = parseResort(resortParam);
    const [details, history] = await Promise.all([
        getRideDetails(id, resort),
        getRideHistory(id, resort)
    ]);

    if (!details) {
        notFound();
    }

    const waitTime = details.queue?.STANDBY?.waitTime ?? 0;
    const isOperating = details.status === "OPERATING";
    const statusColor = isOperating
        ? waitTime > 60
            ? "text-red-500"
            : waitTime > 30
                ? "text-yellow-500"
                : "text-blue-500"
        : "text-zinc-400";

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 lg:p-8 font-sans pb-24">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Navigation Row */}
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <header className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                        <div className="space-y-2">
                            <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-sm">
                                {details.entityType} Analytics
                            </p>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
                                {details.name}
                            </h1>
                        </div>
                        
                        <div className={`flex items-center gap-3 ${statusColor} bg-zinc-50 dark:bg-zinc-950 px-6 py-4 rounded-2xl border border-current/20 shadow-inner`}>
                            {isOperating ? (
                                <>
                                    <Clock className="w-8 h-8" />
                                    <div className="flex flex-col">
                                        <span className="text-4xl font-black tabular-nums leading-none tracking-tighter">{waitTime}</span>
                                        <span className="text-xs font-bold uppercase tracking-wider opacity-80 mt-1">Min Wait</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-8 h-8" />
                                    <span className="text-xl font-bold uppercase tracking-widest">{details.status}</span>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Timeline Component connecting the rich KV History */}
                <WaitTimeTimeline data={history} currentWait={waitTime} resort={resort} />
            </div>
        </main>
    );
}
