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

async function inspect() {
    try {
        const redis = new Redis({
            url: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN,
        });

        const item = await redis.lindex('wait_times_history', 0);
        console.log(JSON.stringify(item, null, 2));

    } catch (e) {
        console.error("Redis Error:", e);
    }
}

inspect();
