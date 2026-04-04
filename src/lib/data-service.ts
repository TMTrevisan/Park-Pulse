"use server";

import fs from "fs/promises";
import path from "path";
import { PARKS, RIDE_METADATA_REGISTRY } from "@/lib/parks";
import { WaitTimeSnapshot, ParkLiveData } from "@/lib/types";
import { Redis } from "@upstash/redis";

const DATA_FILE_PATH = path.join(process.env.NODE_ENV === 'production' ? '/tmp' : process.cwd(), "wait_times.json");
const HISTORY_KEY = 'wait_times_history';
const MAX_HISTORY_ITEMS = 10080; // 7 days of 1-minute snapshots (approx 20MB compressed)

interface CompactSnapshot {
    t: string;
    w: Record<string, number>;
}

function compressSnapshot(snapshot: WaitTimeSnapshot): CompactSnapshot {
    const compact: CompactSnapshot = { t: snapshot.timestamp, w: {} };
    for (const park of snapshot.parks) {
        if (!park.liveData) continue;
        for (const ride of park.liveData) {
            if (typeof ride.queue?.STANDBY?.waitTime === 'number') {
                compact.w[ride.id] = ride.queue.STANDBY.waitTime;
            }
        }
    }
    return compact;
}

function expandSnapshot(item: any): WaitTimeSnapshot {
    if (!item) return item;
    if (item.t && item.w) {
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
        } as unknown as WaitTimeSnapshot;
    }
    return item as WaitTimeSnapshot;
}

/* Helper to ensure directory exists (Local Only) */
async function ensureDirectoryExistence(filePath: string) {
    const dirname = path.dirname(filePath);
    try {
        await fs.access(dirname);
    } catch (e) {
        await fs.mkdir(dirname, { recursive: true }).catch(() => { });
    }
}

async function fetchParkData(parkId: string): Promise<ParkLiveData> {
    const response = await fetch(
        `https://api.themeparks.wiki/v1/entity/${parkId}/live`,
        {
            next: { revalidate: 60 },
            headers: {
                'User-Agent': 'DisneyRideTracker/1.0'
            }
        }
    );
    if (!response.ok) {
        throw new Error(`Failed to fetch data for park ${parkId} - ${response.statusText}`);
    }
    return response.json();
}

/**
 * Determine if we should use Vercel KV (Upstash) or File System
 * Checks for either standard Vercel KV vars or Upstash specific vars
 */
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

// Initialize Redis client if vars are present
const redis = (url && token)
    ? new Redis({ url, token })
    : null;

export async function getHistory(): Promise<WaitTimeSnapshot[]> {
    if (redis) {
        try {
            const result = await redis.lrange(HISTORY_KEY, 0, -1);
            return (result as any[]).map(expandSnapshot) || [];
        } catch (error) {
            console.error("KV Read Error:", error);
            return [];
        }
    } else {
        try {
            await ensureDirectoryExistence(DATA_FILE_PATH);
            const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
            const parsed = JSON.parse(fileContent);
            return parsed.map(expandSnapshot);
        } catch (error) {
            return [];
        }
    }
}

async function saveSnapshot(snapshot: WaitTimeSnapshot, currentHistory: WaitTimeSnapshot[]) {
    // Only save if 60 seconds passed since last entry
    const lastSnapshot = currentHistory[currentHistory.length - 1];
    const lastTime = lastSnapshot ? new Date(lastSnapshot.timestamp).getTime() : 0;
    const currentTime = new Date(snapshot.timestamp).getTime();

    if (currentTime - lastTime < 60 * 1000) {
        return; // Too soon to save
    }

    // Optimization: Strip forecast data to reduce size
    const leanSnapshot: WaitTimeSnapshot = {
        ...snapshot,
        parks: snapshot.parks.map(park => ({
            ...park,
            liveData: park.liveData.map(ride => {
                const { forecast, ...rest } = ride;
                return rest;
            })
        }))
    };

    if (redis) {
        try {
            const compact = compressSnapshot(snapshot);
            // Push to right (end)
            await redis.rpush(HISTORY_KEY, compact);
            // Trim from left (start) to keep only last N items
            await redis.ltrim(HISTORY_KEY, -MAX_HISTORY_ITEMS, -1);
        } catch (error) {
            console.error("KV Write Error:", error);
        }
    } else {
        try {
            const newHistory = [...currentHistory, leanSnapshot];
            if (newHistory.length > MAX_HISTORY_ITEMS) {
                newHistory.shift(); // Remove oldest
            }
            await fs.writeFile(DATA_FILE_PATH, JSON.stringify(newHistory, null, 2));
        } catch (error) {
            console.warn("FS Write Error:", error);
        }
    }
}

export async function getWaitTimes(includeHistory: boolean = true) {
    const timestamp = new Date().toISOString();

    // 1. Fetch live data
    const [disneylandData, dcaData] = await Promise.all([
        fetchParkData(PARKS.DISNEYLAND_PARK),
        fetchParkData(PARKS.DISNEY_CALIFORNIA_ADVENTURE),
    ]);

    const currentSnapshot: WaitTimeSnapshot = {
        timestamp,
        parks: [disneylandData, dcaData],
    };

    // 2. Read history
    const history = await getHistory();

    // 3. Save new snapshot (fire and forget? better to await so UI gets latest)
    await saveSnapshot(currentSnapshot, history);

    // Return current + optional history
    return {
        current: currentSnapshot,
        history: includeHistory ? [...history, currentSnapshot] : []
    };
}

/**
 * Maintenance: Trim the history to ensure we stay within Vercel/Upstash free limits.
 */
export async function trimHistory() {
    if (redis) {
        try {
            const len = await redis.llen(HISTORY_KEY);
            if (len > MAX_HISTORY_ITEMS) {
                await redis.ltrim(HISTORY_KEY, -MAX_HISTORY_ITEMS, -1);
                console.log(`Cron: Trimmed Redis history from ${len} to ${MAX_HISTORY_ITEMS}`);
                return { trimmed: true, original: len, final: MAX_HISTORY_ITEMS };
            }
            return { trimmed: false, length: len };
        } catch (error) {
            console.error("Cron Trim Error:", error);
            throw error;
        }
    }
    return { error: "Redis not configured" };
}

export async function getRideHistory(rideId: string) {
    const history = await getHistory();
    
    const data = history.map(snapshot => {
        let waitTime = null;
        for (const park of snapshot.parks) {
            if (!park.liveData) continue;
            const ride = park.liveData.find((r: any) => r.id === rideId);
            if (ride && ride.queue && ride.queue.STANDBY && typeof ride.queue.STANDBY.waitTime === 'number') {
                waitTime = ride.queue.STANDBY.waitTime;
                break;
            }
        }
        return {
            timestamp: snapshot.timestamp,
            waitTime
        };
    }).filter((point): point is { timestamp: string, waitTime: number } => point.waitTime !== null);
    
    return data;
}

export async function getRideDetails(rideId: string) {
    const [disneylandData, dcaData] = await Promise.all([
        fetchParkData(PARKS.DISNEYLAND_PARK).catch(() => ({ liveData: [] })),
        fetchParkData(PARKS.DISNEY_CALIFORNIA_ADVENTURE).catch(() => ({ liveData: [] })),
    ]);
    
    const ride = (disneylandData.liveData || []).find((r: any) => r.id === rideId) || 
                 (dcaData.liveData || []).find((r: any) => r.id === rideId);
                 
    return ride || null;
}
