const fs = require('fs');
const path = require('path');
const { Redis } = require('@upstash/redis');

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

async function optimize() {
    console.log("--- Optimizing Redis Storage ---");
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
        console.error("Missing Redis credentials.");
        return;
    }

    const redis = new Redis({ url, token });
    const key = 'wait_times_history';

    try {
        const initialLen = await redis.llen(key);
        console.log(`Current items: ${initialLen}`);

        if (initialLen > 50) {
            console.log("Trimming to last 50 items...");
            await redis.ltrim(key, -50, -1);
            const newLen = await redis.llen(key);
            console.log(`New items: ${newLen}`);
            console.log(`✅ Removed ${initialLen - newLen} items.`);
            console.log("Storage usage should drop significantly in your Vercel/Upstash dashboard shortly.");
        } else {
            console.log("Database is already lean (<= 50 items). No action needed.");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

optimize();
