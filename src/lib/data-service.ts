import fs from "fs/promises";
import path from "path";
import { PARKS } from "@/lib/parks";
import { WaitTimeSnapshot, ParkLiveData } from "@/lib/types";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "wait_times.json");

/* Helper to ensure directory exists */
async function ensureDirectoryExistence(filePath: string) {
    const dirname = path.dirname(filePath);
    try {
        await fs.access(dirname);
    } catch (e) {
        await fs.mkdir(dirname, { recursive: true });
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
    let history: WaitTimeSnapshot[] = [];
    try {
        await ensureDirectoryExistence(DATA_FILE_PATH);
        const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
        history = JSON.parse(fileContent);
    } catch (error) {
        // File doesn't exist or is invalid, start new history
    }

    // 3. Append and Save
    // Check if we already have a recent snapshot (e.g. within last 1 minute) to avoid dupes on frequent refresh
    const lastSnapshot = history[history.length - 1];
    const lastTime = lastSnapshot ? new Date(lastSnapshot.timestamp).getTime() : 0;
    const currentTime = new Date(timestamp).getTime();

    if (currentTime - lastTime > 60 * 1000) { // Only save every minute
        history.push(currentSnapshot);
        // Limit history size (e.g., last 1000 entries)
        if (history.length > 2000) {
            history = history.slice(-2000);
        }
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(history, null, 2));
    } else {
        // Just update the latest snapshot in memory for return, but don't save file if too soon?
        // Actually, user wants "current" time. We should return the fetched one even if we don't save history.
    }

    return { current: currentSnapshot, history };
}
