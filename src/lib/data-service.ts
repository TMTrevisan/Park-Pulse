"use server";

import fs from "fs/promises";
import path from "path";
import { PARKS } from "@/lib/parks";
import { WaitTimeSnapshot, ParkLiveData } from "@/lib/types";
import { kv } from "@vercel/kv";

const DATA_FILE_PATH = path.join(process.env.NODE_ENV === 'production' ? '/tmp' : process.cwd(), "wait_times.json");
const HISTORY_KEY = 'wait_times_history';
const MAX_HISTORY_ITEMS = 2000;

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
            cache: "no-store",
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
 * Determine if we should use Vercel KV or File System
 */
const useKV = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

async function getHistory(): Promise<WaitTimeSnapshot[]> {
    if (useKV) {
        try {
            // KV returns typed objects automatically if parsing valid JSON
            const result = await kv.lrange(HISTORY_KEY, 0, -1);
            return (result as unknown as WaitTimeSnapshot[]) || [];
        } catch (error) {
            console.error("KV Read Error:", error);
            return [];
        }
    } else {
        try {
            await ensureDirectoryExistence(DATA_FILE_PATH);
            const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
            return JSON.parse(fileContent);
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

    if (useKV) {
        try {
            // Push to right (end)
            await kv.rpush(HISTORY_KEY, snapshot);
            // Trim from left (start) to keep only last N items
            // ltrim indices are inclusive. -2000 to -1 keeps last 2000
            await kv.ltrim(HISTORY_KEY, -MAX_HISTORY_ITEMS, -1);
        } catch (error) {
            console.error("KV Write Error:", error);
        }
    } else {
        try {
            const newHistory = [...currentHistory, snapshot];
            if (newHistory.length > MAX_HISTORY_ITEMS) {
                newHistory.shift(); // Remove oldest
            }
            await fs.writeFile(DATA_FILE_PATH, JSON.stringify(newHistory, null, 2));
        } catch (error) {
            console.warn("FS Write Error:", error);
        }
    }
}

export async function getWaitTimes() {
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

    // Return current + history. Note: saveSnapshot might have added one, but 
    // for simplicity we return the history we read + the current one.
    return {
        current: currentSnapshot,
        history: [...history, currentSnapshot]
    };
}
