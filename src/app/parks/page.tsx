'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import type { SelectablePark } from '@/lib/park-providers';

const PROVIDER_LABELS = {
    themeparks: 'ThemeParks.wiki',
    'queue-times': 'Queue-Times',
} as const;

export default function ParksPage() {
    const [parks, setParks] = useState<SelectablePark[]>([]);
    const [query, setQuery] = useState('');
    const [provider, setProvider] = useState<'all' | SelectablePark['provider']>('all');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/parks')
            .then(async response => {
                if (!response.ok) throw new Error('Unable to load parks');
                return response.json() as Promise<{ parks: SelectablePark[] }>;
            })
            .then(({ parks }) => setParks(parks))
            .catch(() => setError('Unable to load the park catalog. Please try again shortly.'));
    }, []);

    const visibleParks = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return parks.filter(park =>
            (provider === 'all' || park.provider === provider)
            && (!normalizedQuery || `${park.name} ${park.group}`.toLowerCase().includes(normalizedQuery))
        );
    }, [parks, provider, query]);

    return (
        <main className="min-h-screen bg-zinc-50 p-4 text-zinc-900 dark:bg-black dark:text-zinc-100 md:p-8">
            <div className="mx-auto max-w-5xl">
                <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-blue-600">
                    <ChevronLeft className="h-4 w-4" /> Back to Disney dashboard
                </Link>
                <h1 className="text-3xl font-black tracking-tight">Explore live park waits</h1>
                <p className="mt-2 text-zinc-500">Choose any currently listed park from ThemeParks.wiki or Queue-Times.</p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <label className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search parks or operators" className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 outline-none ring-blue-500 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-900" />
                    </label>
                    <select value={provider} onChange={event => setProvider(event.target.value as typeof provider)} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                        <option value="all">All providers</option>
                        <option value="themeparks">ThemeParks.wiki</option>
                        <option value="queue-times">Queue-Times</option>
                    </select>
                </div>

                {error ? <p role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</p> : (
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {visibleParks.map(park => (
                            <Link key={`${park.provider}:${park.id}`} href={`/park/${park.provider}/${encodeURIComponent(park.id)}`} className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-blue-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-start justify-between gap-3">
                                    <div><h2 className="font-bold">{park.name}</h2><p className="mt-1 text-sm text-zinc-500">{park.group}</p></div>
                                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:bg-blue-950 dark:text-blue-300">{PROVIDER_LABELS[park.provider]}</span>
                                </div>
                            </Link>
                        ))}
                        {parks.length === 0 && <p className="col-span-full py-12 text-center text-zinc-500">Loading park catalog…</p>}
                        {parks.length > 0 && visibleParks.length === 0 && <p className="col-span-full py-12 text-center text-zinc-500">No parks match this search.</p>}
                    </div>
                )}
            </div>
        </main>
    );
}
