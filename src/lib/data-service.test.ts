import { describe, it, expect } from 'vitest';
import { RIDE_METADATA_REGISTRY } from '@/lib/parks';

// A mock of the functions we need to test
function isCompactSnapshot(item: any): boolean {
    return typeof item?.t === 'string' && typeof item?.w === 'object';
}

function expandSnapshot(item: any): any {
    if (!item) return item;
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
    return item;
}

function simulateDownsampling(rawResult: any[], now: number) {
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const downsampled: any[] = [];
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
        
        const spaceMountain = expanded.parks[0].liveData.find((r: any) => r.id === "ride-space-mountain");
        expect(spaceMountain.queue.STANDBY.waitTime).toBe(45);
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
