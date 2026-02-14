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

async function test() {
    console.log("--- Debugging Redis Connection ---");
    console.log("KV_REST_API_URL:", process.env.KV_REST_API_URL ? "Present" : "Missing");
    console.log("KV_REST_API_TOKEN:", process.env.KV_REST_API_TOKEN ? "Present" : "Missing");

    // Attempt explicit initialization
    try {
        const redis = new Redis({
            url: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN,
        });

        console.log("\n1. Testing Write...");
        await redis.set('debug_timestamp', new Date().toISOString());
        console.log("✅ Write successful");

        console.log("\n2. Testing Read...");
        const val = await redis.get('debug_timestamp');
        console.log("✅ Read successful:", val);

        console.log("\n3. Checking History ('wait_times_history')...");
        const type = await redis.type('wait_times_history');
        console.log("Key Type:", type);

        if (type === 'list') {
            const len = await redis.llen('wait_times_history');
            console.log("Length:", len);

            if (len > 0) {
                const item = await redis.lindex('wait_times_history', 0);
                console.log("Sample Item (Head):", JSON.stringify(item).substring(0, 100) + "...");
            }
        } else {
            console.log("Key does not exist or is not a list (Expected if brand new)");
        }

    } catch (e) {
        console.error("\n❌ Redis Error:", e);
    }
}

test();
