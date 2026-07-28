"use server";

import fs from "fs/promises";
import path from "path";
import { RESORT_PARKS } from "@/lib/parks";
import type { ResortId } from "@/lib/parks";
import { WaitTimeSnapshot, ParkLiveData } from "@/lib/types";
import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";
import { compressSnapshot, expandSnapshot, isCompactSnapshot } from '@/lib/snapshot-codec';
import type { CompactSnapshot } from '@/lib/snapshot-codec';

const DATA_FILE_PATH = (resort: ResortId) =>
    path.join(
        process.env.NODE_ENV === 'production' ? '/tmp' : process.cwd(),
        `wait_times_${resort.toLowerCase()}.json`
    );

const HISTORY_KEY = (resort: ResortId) => `wait_times_history_${resort.toLowerCase()}`;
const MAX_HISTORY_ITEMS = 10080; // 7 days of 1-minute snapshots
const PARK_API_TIMEOUT_MS = 15_000;

function expandHistoryItems(items: unknown[], context: string): WaitTimeSnapshot[] {
    const snapshots = items.map(expandSnapshot);
    const invalidCount = snapshots.filter((snapshot): snapshot is null => snapshot === null).length;
    if (invalidCount > 0) {
        logger.warn('data-service:history-validation', `Ignored ${invalidCount} malformed ${context} history item(s)`);
    }
    return snapshots.filter((snapshot): snapshot is WaitTimeSnapshot => snapshot !== null);
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
            headers: { 'User-Agent': 'DisneyRideTracker/1.0' },
            signal: AbortSignal.timeout(PARK_API_TIMEOUT_MS),
        }
    );
    if (!response.ok) {
        const msg = `Failed to fetch data for park ${parkId} - ${response.status} ${response.statusText}`;
        logger.error('data-service:fetchParkData', msg);
        throw new Error(msg);
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
            
            const downsampled: CompactSnapshot[] = [];
            let invalidCount = 0;
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
                } else {
                    invalidCount += 1;
                }
            }

            if (invalidCount > 0) {
                logger.warn('data-service:history-validation', `Ignored ${invalidCount} malformed Redis history item(s)`);
            }
            return expandHistoryItems(downsampled, 'Redis');
        } catch (error) {
            logger.error("data-service:getHistory", "KV Read Error", error);
            // Fallback to local files in dev
            if (process.env.NODE_ENV === 'development') {
                try {
                    const filePath = DATA_FILE_PATH(resort);
                    await ensureDirectoryExistence(filePath);
                    const fileContent = await fs.readFile(filePath, "utf-8");
                    const parsed: unknown = JSON.parse(fileContent);
                    return Array.isArray(parsed) ? expandHistoryItems(parsed, 'local') : [];
                } catch { }
            }
            return [];
        }
    } else {
        try {
            const filePath = DATA_FILE_PATH(resort);
            await ensureDirectoryExistence(filePath);
            const fileContent = await fs.readFile(filePath, "utf-8");
            const parsed: unknown = JSON.parse(fileContent);
            return Array.isArray(parsed) ? expandHistoryItems(parsed, 'local') : [];
        } catch {
            return [];
        }
    }
}

async function saveSnapshot(snapshot: WaitTimeSnapshot, resort: ResortId) {
    const leanSnapshot: WaitTimeSnapshot = {
        ...snapshot,
        parks: snapshot.parks.map(park => ({
            ...park,
            liveData: park.liveData.map(ride => {
                const leanRide = { ...ride };
                delete leanRide.forecast;
                return leanRide;
            })
        }))
    };

    if (redis) {
        try {
            // Read the raw tail item rather than getHistory(), which is downsampled
            // for client payload size and cannot safely be used for deduplication.
            const lastItem = await redis.lindex(HISTORY_KEY(resort), -1);
            const lastSnapshot = expandSnapshot(lastItem);
            const lastTime = lastSnapshot?.timestamp ? new Date(lastSnapshot.timestamp).getTime() : 0;
            const currentTime = new Date(snapshot.timestamp).getTime();
            if (currentTime - lastTime < 60 * 1000) return;

            const compact = compressSnapshot(snapshot);
            await redis.rpush(HISTORY_KEY(resort), compact);
            await redis.ltrim(HISTORY_KEY(resort), -MAX_HISTORY_ITEMS, -1);
        } catch (error) {
            logger.error("data-service:saveSnapshot", "KV Write Error", error);
        }
    } else {
        try {
            const filePath = DATA_FILE_PATH(resort);
            const fileContent = await fs.readFile(filePath, "utf-8").catch(() => "[]");
            const currentHistory = JSON.parse(fileContent) as WaitTimeSnapshot[];
            const lastSnapshot = currentHistory[currentHistory.length - 1];
            const lastTime = lastSnapshot ? new Date(lastSnapshot.timestamp).getTime() : 0;
            const currentTime = new Date(snapshot.timestamp).getTime();
            if (currentTime - lastTime < 60 * 1000) return;

            const newHistory = [...currentHistory, leanSnapshot];
            if (newHistory.length > MAX_HISTORY_ITEMS) newHistory.shift();
            await fs.writeFile(filePath, JSON.stringify(newHistory, null, 2));
        } catch (error) {
            logger.warn("data-service:saveSnapshot", "FS Write Error", error);
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

    const parkDataResults = await Promise.allSettled(parkIds.map(fetchParkData));
    const failedParkIds = parkDataResults
        .map((result, index) => result.status === 'rejected' ? parkIds[index] : null)
        .filter((id): id is string => id !== null);

    if (failedParkIds.length > 0) {
        const message = `Skipped snapshot because ${failedParkIds.length} park fetch(es) failed`;
        logger.error('data-service:fetchAndSaveSnapshot', message, { resort, failedParkIds });
        throw new Error(message);
    }

    const currentSnapshot: WaitTimeSnapshot = {
        timestamp,
        parks: parkDataResults
            .filter((result): result is PromiseFulfilledResult<ParkLiveData> => result.status === 'fulfilled')
            .map(result => result.value),
    };

    await saveSnapshot(currentSnapshot, resort);
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
            logger.error("data-service:trimHistory", "Cron Trim Error", error);
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
