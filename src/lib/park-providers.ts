import type { ParkLiveData, Ride, WaitTimeSnapshot } from '@/lib/types';

export type ParkProviderId = 'themeparks' | 'queue-times';

export interface SelectablePark {
    provider: ParkProviderId;
    id: string;
    name: string;
    group: string;
    timezone?: string;
}

type ThemeDestinationsResponse = {
    destinations: Array<{ name: string; parks: Array<{ id: string; name: string }> }>;
};

type QueueTimesParksResponse = Array<{
    name: string;
    parks: Array<{ id: number; name: string; timezone?: string }>;
}>;

type QueueTimesLiveResponse = {
    lands?: Array<{
        rides?: Array<{ id: number; name: string; is_open: boolean; wait_time: number | null; last_updated?: string }>;
    }>;
    rides?: Array<{ id: number; name: string; is_open: boolean; wait_time: number | null; last_updated?: string }>;
};

const THEME_PARKS_BASE_URL = 'https://api.themeparks.wiki/v1';
const QUEUE_TIMES_BASE_URL = 'https://queue-times.com';

async function fetchJson<T>(url: string, revalidate: number): Promise<T> {
    const response = await fetch(url, {
        next: { revalidate },
        headers: { 'User-Agent': 'ParkPulse/1.0' },
        signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`Provider request failed: ${response.status} ${response.statusText}`);
    return response.json() as Promise<T>;
}

export async function getParkCatalog(): Promise<SelectablePark[]> {
    const [themeParksResult, queueTimesResult] = await Promise.allSettled([
        fetchJson<ThemeDestinationsResponse>(`${THEME_PARKS_BASE_URL}/destinations`, 60 * 60),
        fetchJson<QueueTimesParksResponse>(`${QUEUE_TIMES_BASE_URL}/parks.json`, 60 * 60),
    ]);

    // One provider being unavailable should not hide the other provider's parks.
    const themeParks = themeParksResult.status === 'fulfilled' ? themeParksResult.value : { destinations: [] };
    const queueTimes = queueTimesResult.status === 'fulfilled' ? queueTimesResult.value : [];

    if (themeParksResult.status === 'rejected' && queueTimesResult.status === 'rejected') {
        throw new Error('All park catalog providers are unavailable');
    }

    return [
        ...themeParks.destinations.flatMap(destination => destination.parks.map(park => ({
            provider: 'themeparks' as const,
            id: park.id,
            name: park.name,
            group: destination.name,
        }))),
        ...queueTimes.flatMap(group => group.parks.map(park => ({
            provider: 'queue-times' as const,
            id: String(park.id),
            name: park.name,
            group: group.name,
            timezone: park.timezone,
        }))),
    ].sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeQueueTimesRide(ride: NonNullable<QueueTimesLiveResponse['rides']>[number], parkId: string): Ride {
    const isOperating = ride.is_open;
    return {
        id: `queue-times:${parkId}:${ride.id}`,
        name: ride.name,
        entityType: 'ATTRACTION',
        parkId,
        externalId: String(ride.id),
        status: isOperating ? 'OPERATING' : 'CLOSED',
        lastUpdated: ride.last_updated || new Date().toISOString(),
        queue: typeof ride.wait_time === 'number' ? { STANDBY: { waitTime: ride.wait_time } } : undefined,
    };
}

export async function getLivePark(provider: ParkProviderId, parkId: string): Promise<ParkLiveData> {
    if (provider === 'themeparks') {
        const park = await fetchJson<ParkLiveData>(`${THEME_PARKS_BASE_URL}/entity/${encodeURIComponent(parkId)}/live`, 60);
        return park;
    }

    if (!/^\d+$/.test(parkId)) throw new Error('Queue-Times park IDs must be numeric');
    const data = await fetchJson<QueueTimesLiveResponse>(`${QUEUE_TIMES_BASE_URL}/parks/${parkId}/queue_times.json`, 60);
    const rides = [...(data.rides || []), ...(data.lands || []).flatMap(land => land.rides || [])]
        .map(ride => normalizeQueueTimesRide(ride, parkId));
    return { id: `queue-times:${parkId}`, name: 'Queue-Times Park', liveData: rides };
}

export async function getUniversalParkWaitTimes(provider: ParkProviderId, parkId: string): Promise<{ current: WaitTimeSnapshot; history: WaitTimeSnapshot[] }> {
    const park = await getLivePark(provider, parkId);
    return {
        current: { timestamp: new Date().toISOString(), parks: [park] },
        history: [],
    };
}
