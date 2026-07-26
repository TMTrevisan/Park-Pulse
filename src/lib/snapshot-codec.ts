import { RIDE_METADATA_REGISTRY } from '@/lib/parks';
import type { WaitTimeSnapshot } from '@/lib/types';

export interface CompactSnapshot {
    t: string;
    w: Record<string, number>;
}

export function isCompactSnapshot(item: unknown): item is CompactSnapshot {
    if (!item || typeof item !== 'object') return false;
    const record = item as Record<string, unknown>;
    if (typeof record.t !== 'string' || Number.isNaN(Date.parse(record.t))) return false;
    if (!record.w || typeof record.w !== 'object' || Array.isArray(record.w)) return false;
    return Object.values(record.w).every(waitTime => typeof waitTime === 'number' && Number.isFinite(waitTime) && waitTime >= 0);
}

export function compressSnapshot(snapshot: WaitTimeSnapshot): CompactSnapshot {
    const compact: CompactSnapshot = { t: snapshot.timestamp, w: {} };
    for (const park of snapshot.parks) {
        for (const ride of park.liveData || []) {
            if (typeof ride.queue?.STANDBY?.waitTime === 'number') {
                compact.w[ride.id] = ride.queue.STANDBY.waitTime;
            }
        }
    }
    return compact;
}

export function expandSnapshot(item: unknown): WaitTimeSnapshot | null {
    if (isCompactSnapshot(item)) {
        return {
            timestamp: item.t,
            parks: [{
                id: 'history',
                name: 'Historical Data',
                liveData: Object.entries(item.w).map(([id, waitTime]) => ({
                    id,
                    name: RIDE_METADATA_REGISTRY[id] || 'Unknown Ride',
                    entityType: 'ATTRACTION',
                    status: 'OPERATING',
                    queue: { STANDBY: { waitTime } },
                })),
            }],
        } as unknown as WaitTimeSnapshot;
    }
    return isWaitTimeSnapshot(item) ? item : null;
}

function isWaitTimeSnapshot(item: unknown): item is WaitTimeSnapshot {
    if (!item || typeof item !== 'object') return false;
    const record = item as Record<string, unknown>;
    return typeof record.timestamp === 'string'
        && !Number.isNaN(Date.parse(record.timestamp))
        && Array.isArray(record.parks);
}
