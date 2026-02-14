const { Redis } = require('@upstash/redis');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) {
            process.env[key.trim()] = val.trim().replace(/"/g, '');
        }
    });
} catch (e) {
    console.log("Could not load .env.local", e.message);
}

async function measure() {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    const redis = new Redis({ url, token });
    const key = 'wait_times_history';

    try {
        console.log("Fetching last item...");
        const item = await redis.lindex(key, -1);

        if (item) {
            const sizeBytes = JSON.stringify(item).length;
            const sizeKB = sizeBytes / 1024;
            console.log(`Snapshot Size: ${sizeKB.toFixed(2)} KB`);
            console.log(`Max items in 10MB limit: ${Math.floor((10 * 1024) / sizeKB)} items`);
            console.log(`Current Fetch (50 items) est size: ${(sizeKB * 50 / 1024).toFixed(2)} MB`);
        } else {
            console.log("No items found in history.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

measure();
