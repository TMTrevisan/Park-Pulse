import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getUniversalParkWaitTimes } from '@/lib/park-providers';
import type { ParkProviderId } from '@/lib/park-providers';

function parseProvider(provider: string): ParkProviderId | null {
    return provider === 'themeparks' || provider === 'queue-times' ? provider : null;
}

export const dynamic = 'force-dynamic';

export default async function UniversalParkPage({ params }: { params: Promise<{ provider: string; id: string }> }) {
    const { provider: providerParam, id } = await params;
    const provider = parseProvider(providerParam);
    if (!provider) notFound();

    const { current } = await getUniversalParkWaitTimes(provider, id);
    const park = current.parks[0];
    const rides = park.liveData.filter(ride => ride.entityType === 'ATTRACTION').sort((a, b) => (b.queue?.STANDBY?.waitTime || 0) - (a.queue?.STANDBY?.waitTime || 0));

    return (
        <main className="min-h-screen bg-zinc-50 p-4 text-zinc-900 dark:bg-black dark:text-zinc-100 md:p-8">
            <div className="mx-auto max-w-5xl">
                <Link href="/parks" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-blue-600"><ChevronLeft className="h-4 w-4" /> Choose another park</Link>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">{provider === 'themeparks' ? 'ThemeParks.wiki' : 'Queue-Times'} live data</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight">{park.name}</h1>
                <p className="mt-1 text-sm text-zinc-500">Live wait times only. History, maps, itineraries, and Disney ticket metadata are intentionally unavailable for non-Disney parks.</p>
                {provider === 'queue-times' && (
                    <p className="mt-2 text-sm text-zinc-500">Powered by <a className="font-semibold text-blue-600 hover:underline" href="https://queue-times.com" target="_blank" rel="noreferrer">Queue-Times.com</a></p>
                )}
                <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                    {rides.map(ride => (
                        <div key={ride.id} className="flex items-center justify-between gap-4 border-b border-zinc-100 px-4 py-3 last:border-0 dark:border-zinc-800">
                            <div><p className="font-semibold">{ride.name}</p><p className="text-xs text-zinc-500">{ride.status}</p></div>
                            <span className="rounded-xl bg-blue-50 px-3 py-2 font-black tabular-nums text-blue-700 dark:bg-blue-950 dark:text-blue-300">{ride.status === 'OPERATING' ? `${ride.queue?.STANDBY?.waitTime ?? 0} min` : ride.status}</span>
                        </div>
                    ))}
                    {rides.length === 0 && <p className="p-8 text-center text-zinc-500">This provider currently has no attraction waits for this park.</p>}
                </div>
            </div>
        </main>
    );
}
