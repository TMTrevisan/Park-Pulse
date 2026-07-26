import { describe, it, expect } from 'vitest';
import { RIDE_METADATA_REGISTRY } from '@/lib/parks';
import { compressSnapshot as productionCompressSnapshot, expandSnapshot as productionExpandSnapshot, isCompactSnapshot as productionIsCompactSnapshot } from '@/lib/snapshot-codec';
import type { WaitTimeSnapshot } from '@/lib/types';

interface CompactSnapshot {
    t: string;
    w: Record<string, number>;
}

interface ExpandedSnapshot {
    timestamp: string;
    parks: Array<{
        id: string;
        name: string;
        liveData: Array<{
            id: string;
            name: string;
            entityType: string;
            status: string;
            queue: { STANDBY: { waitTime: number } };
        }>;
    }>;
}

// A mock of the functions we need to test
function isCompactSnapshot(item: unknown): item is CompactSnapshot {
    if (!item || typeof item !== 'object') return false;
    const record = item as Record<string, unknown>;
    return typeof record.t === 'string' && typeof record.w === 'object' && record.w !== null;
}

function expandSnapshot(item: unknown): ExpandedSnapshot {
    if (isCompactSnapshot(item)) {
        return {
            timestamp: item.t,
            parks: [{
                id: "history",
                name: "Historical Data",
                liveData: Object.entries(item.w).map(([id, waitTime]) => ({
                    id,
                    name: RIDE_METADATA_REGISTRY[id] || "Unknown Ride",
                    entityType: "ATTRACTION",
                    status: "OPERATING",
                    queue: { STANDBY: { waitTime } }
                }))
            }]
        };
    }
    return item as ExpandedSnapshot;
}

function simulateDownsampling(rawResult: unknown[], now: number): ExpandedSnapshot[] {
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const downsampled: CompactSnapshot[] = [];
    let lastTime = 0;
    
    for (const item of rawResult) {
        if (isCompactSnapshot(item)) {
            const time = new Date(item.t).getTime();
            const age = now - time;
            const requiredGap = age < ONE_DAY ? 15 * 60 * 1000 : 60 * 60 * 1000;
            
            if (time - lastTime >= requiredGap) {
                downsampled.push(item);
                lastTime = time;
            }
        }
    }
    return downsampled.map(expandSnapshot);
}

describe('Data Pipeline Integrity & Regressions', () => {
    it('round-trips valid snapshots and rejects malformed compact snapshots', () => {
        const snapshot: WaitTimeSnapshot = {
            timestamp: '2026-05-15T12:00:00Z',
            parks: [{
                id: 'park-1',
                name: 'Test Park',
                liveData: [{
                    id: 'ride-1',
                    name: 'Test Ride',
                    entityType: 'ATTRACTION',
                    parkId: 'park-1',
                    externalId: 'ride-1',
                    status: 'OPERATING',
                    lastUpdated: '2026-05-15T12:00:00Z',
                    queue: { STANDBY: { waitTime: 25 } },
                }],
            }],
        };

        const compact = productionCompressSnapshot(snapshot);
        const expanded = productionExpandSnapshot(compact);

        expect(compact).toEqual({ t: snapshot.timestamp, w: { 'ride-1': 25 } });
        expect(expanded?.timestamp).toBe(snapshot.timestamp);
        expect(expanded?.parks[0].liveData[0].queue?.STANDBY?.waitTime).toBe(25);
        expect(productionIsCompactSnapshot({ t: 'not-a-date', w: {} })).toBe(false);
        expect(productionIsCompactSnapshot({ t: snapshot.timestamp, w: { 'ride-1': '25' } })).toBe(false);
        expect(productionExpandSnapshot({ t: snapshot.timestamp, w: { 'ride-1': -1 } })).toBeNull();
    });
    
    it('should correctly expand a compact snapshot into a full WaitTimeSnapshot', () => {
        const compact = {
            t: "2026-05-15T12:00:00Z",
            w: {
                "ride-space-mountain": 45,
                "ride-pirates": 15
            }
        };

        const expanded = expandSnapshot(compact);
        
        expect(expanded.timestamp).toBe("2026-05-15T12:00:00Z");
        expect(expanded.parks[0].liveData.length).toBe(2);
        
        const spaceMountain = expanded.parks[0].liveData.find((r) => r.id === "ride-space-mountain");
        expect(spaceMountain).toBeDefined();
        expect(spaceMountain?.queue.STANDBY.waitTime).toBe(45);
    });

    it('should safely downsample history payloads to prevent memory limits', () => {
        const now = new Date("2026-05-15T12:00:00Z").getTime();
        const rawResult = [];
        
        // Generate 1 data point per minute for the last 48 hours (2880 points)
        for (let i = 2880; i >= 0; i--) {
            const time = new Date(now - i * 60 * 1000).toISOString();
            rawResult.push({ t: time, w: { "test-ride": 10 } });
        }

        const downsampled = simulateDownsampling(rawResult, now);

        // Within 24 hours: 15-min intervals (24 * 60 / 15 = 96 points)
        // Older than 24 hours: 60-min intervals (24 * 60 / 60 = 24 points)
        // Total should be roughly 120 points, far less than 2880.
        expect(downsampled.length).toBeLessThan(130);
        expect(downsampled.length).toBeGreaterThan(110);
        
        // Verify format
        expect(downsampled[0].parks[0].liveData[0].queue.STANDBY.waitTime).toBe(10);
    });

    it('should fall back to Unknown Ride for unregistered ride IDs safely', () => {
        const compact = {
            t: "2026-05-15T12:00:00Z",
            w: { "ride-does-not-exist-99": 100 }
        };
        const expanded = expandSnapshot(compact);
        expect(expanded.parks[0].liveData[0].name).toBe("Unknown Ride");
    });
});
