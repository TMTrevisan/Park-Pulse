"use server";

import fs from "fs/promises";
import path from "path";
import { PARKS, RESORT_PARKS, RIDE_METADATA_REGISTRY } from "@/lib/parks";
import type { ResortId } from "@/lib/parks";
import { WaitTimeSnapshot, ParkLiveData } from "@/lib/types";
import { Redis } from "@upstash/redis";

const DATA_FILE_PATH = (resort: ResortId) =>
    path.join(
        process.env.NODE_ENV === 'production' ? '/tmp' : process.cwd(),
        `wait_times_${resort.toLowerCase()}.json`
    );

const HISTORY_KEY = (resort: ResortId) => `wait_times_history_${resort.toLowerCase()}`;
const MAX_HISTORY_ITEMS = 10080; // 7 days of 1-minute snapshots

interface CompactSnapshot {
    t: string;
    w: Record<string, number>;
}

function isCompactSnapshot(item: unknown): item is CompactSnapshot {
    if (!item || typeof item !== 'object') return false;
    const record = item as Record<string, unknown>;
    return typeof record.t === 'string' && typeof record.w === 'object' && record.w !== null;
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

function expandSnapshot(item: unknown): WaitTimeSnapshot {
    if (!item) return item as WaitTimeSnapshot;
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
        } as unknown as WaitTimeSnapshot;
    }
    return item as WaitTimeSnapshot;
}

async function ensureDirectoryExistence(filePath: string) {
    const dirname = path.dirname(filePath);
    try {
        await fs.access(dirname);
    } catch {
        await fs.mkdir(dirname, { recursive: true }).catch(() => { });
    }
}

async function fetchParkData(parkId: string): Promise<ParkLiveData> {
    const response = await fetch(
        `https://api.themeparks.wiki/v1/entity/${parkId}/live`,
        {
            next: { revalidate: 60 },
            headers: { 'User-Agent': 'DisneyRideTracker/1.0' }
        }
    );
    if (!response.ok) {
        throw new Error(`Failed to fetch data for park ${parkId} - ${response.statusText}`);
    }
    return response.json();
}

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const redis = (url && token)
    ? new Redis({ url, token })
    : null;

export async function getHistory(resort: ResortId = 'DLR'): Promise<WaitTimeSnapshot[]> {
    if (redis) {
        try {
            // Upstash REST API has a 10MB response limit. 7 days of 1-minute data is ~15MB.
            // We must fetch in chunks to avoid ERR max request size exceeded.
            const totalItems = await redis.llen(HISTORY_KEY(resort));
            let rawResult: unknown[] = [];
            
            const chunkSize = 2000;
            for (let i = 0; i < totalItems; i += chunkSize) {
                const chunk = await redis.lrange(HISTORY_KEY(resort), i, i + chunkSize - 1);
                rawResult = rawResult.concat(chunk);
            }

            // Downsample to reduce payload size to the client (Vercel 4.5MB limit)
            const now = Date.now();
            const ONE_DAY = 24 * 60 * 60 * 1000;
            
            const downsampled: unknown[] = [];
            let lastTime = 0;
            
            for (const item of rawResult) {
                if (isCompactSnapshot(item)) {
                    const time = new Date(item.t).getTime();
                    const age = now - time;
                    
                    // 15 min resolution for the last 24 hours
                    // 60 min resolution for data older than 24 hours
                    const requiredGap = age < ONE_DAY ? 15 * 60 * 1000 : 60 * 60 * 1000;
                    
                    if (time - lastTime >= requiredGap) {
                        downsampled.push(item);
                        lastTime = time;
                    }
                }
            }

            return downsampled.map(expandSnapshot) || [];
        } catch (error) {
            console.error("KV Read Error:", error);
            // Fallback to local files in dev
            if (process.env.NODE_ENV === 'development') {
                try {
                    const filePath = DATA_FILE_PATH(resort);
                    await ensureDirectoryExistence(filePath);
                    const fileContent = await fs.readFile(filePath, "utf-8");
                    const parsed = JSON.parse(fileContent);
                    return parsed.map(expandSnapshot);
                } catch { }
            }
            return [];
        }
    } else {
        try {
            const filePath = DATA_FILE_PATH(resort);
            await ensureDirectoryExistence(filePath);
            const fileContent = await fs.readFile(filePath, "utf-8");
            const parsed = JSON.parse(fileContent);
            return parsed.map(expandSnapshot);
        } catch {
            return [];
        }
    }
}

async function saveSnapshot(snapshot: WaitTimeSnapshot, currentHistory: WaitTimeSnapshot[], resort: ResortId) {
    const lastSnapshot = currentHistory[currentHistory.length - 1];
    const lastTime = lastSnapshot ? new Date(lastSnapshot.timestamp).getTime() : 0;
    const currentTime = new Date(snapshot.timestamp).getTime();

    if (currentTime - lastTime < 60 * 1000) return;

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
            await redis.rpush(HISTORY_KEY(resort), compact);
            await redis.ltrim(HISTORY_KEY(resort), -MAX_HISTORY_ITEMS, -1);
        } catch (error) {
            console.error("KV Write Error:", error);
        }
    } else {
        try {
            const filePath = DATA_FILE_PATH(resort);
            const newHistory = [...currentHistory, leanSnapshot];
            if (newHistory.length > MAX_HISTORY_ITEMS) newHistory.shift();
            await fs.writeFile(filePath, JSON.stringify(newHistory, null, 2));
        } catch (error) {
            console.warn("FS Write Error:", error);
        }
    }
}

export async function getWaitTimes(includeHistory: boolean = false, resort: ResortId = 'DLR') {
    const timestamp = new Date().toISOString();
    const parkIds = RESORT_PARKS[resort];

    const parkDataResults = await Promise.all(
        parkIds.map(id => fetchParkData(id).catch(() => ({ id, name: 'Unknown', liveData: [] })))
    );

    const currentSnapshot: WaitTimeSnapshot = {
        timestamp,
        parks: parkDataResults as ParkLiveData[],
    };

    if (includeHistory) {
        const history = await getHistory(resort);
        return {
            current: currentSnapshot,
            history: [...history, currentSnapshot]
        };
    }

    return {
        current: currentSnapshot,
        history: []
    };
}

export async function fetchAndSaveSnapshot(resort: ResortId = 'DLR') {
    const timestamp = new Date().toISOString();
    const parkIds = RESORT_PARKS[resort];

    const parkDataResults = await Promise.all(
        parkIds.map(id => fetchParkData(id).catch(() => ({ id, name: 'Unknown', liveData: [] })))
    );

    const currentSnapshot: WaitTimeSnapshot = {
        timestamp,
        parks: parkDataResults as ParkLiveData[],
    };

    const history = await getHistory(resort);
    await saveSnapshot(currentSnapshot, history, resort);
    return { success: true, timestamp };
}

export async function trimHistory(resort: ResortId = 'DLR') {
    if (redis) {
        try {
            const key = HISTORY_KEY(resort);
            const len = await redis.llen(key);
            if (len > MAX_HISTORY_ITEMS) {
                await redis.ltrim(key, -MAX_HISTORY_ITEMS, -1);
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

export async function getRideHistory(rideId: string, resort: ResortId = 'DLR') {
    const history = await getHistory(resort);
    return history.map(snapshot => {
        let waitTime = null;
        for (const park of snapshot.parks) {
            if (!park.liveData) continue;
            const ride = park.liveData.find((r) => r.id === rideId);
            if (ride?.queue?.STANDBY && typeof ride.queue.STANDBY.waitTime === 'number') {
                waitTime = ride.queue.STANDBY.waitTime;
                break;
            }
        }
        return { timestamp: snapshot.timestamp, waitTime };
    }).filter((point): point is { timestamp: string, waitTime: number } => point.waitTime !== null);
}

export async function getRideDetails(rideId: string, resort: ResortId = 'DLR') {
    const parkIds = RESORT_PARKS[resort];
    const results = await Promise.all(
        parkIds.map(id => fetchParkData(id).catch(() => ({ liveData: [] })))
    );
    for (const data of results) {
        const ride = (data.liveData || []).find((r) => r.id === rideId);
        if (ride) return ride;
    }
    return null;
}
