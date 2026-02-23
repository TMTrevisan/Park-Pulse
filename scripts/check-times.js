const { Redis } = require('@upstash/redis');
const fs = require('fs');
const path = require('path');

// Load env
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) { process.env[key.trim()] = val.trim().replace(/\"/g, ''); }
    });
} catch (e) { }

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = new Redis({ url, token });

async function checkData() {
    console.log("--- Checking History Timestamps ---");
    const firstItem = await redis.lrange('wait_times_history', 0, 0);
    const lastItem = await redis.lrange('wait_times_history', -1, -1);

    if (firstItem.length > 0) {
        console.log("First item timestamp:", firstItem[0].timestamp, "->", new Date(firstItem[0].timestamp).toLocaleString());
    }
    if (lastItem.length > 0) {
        console.log("Last item timestamp:", lastItem[0].timestamp, "->", new Date(lastItem[0].timestamp).toLocaleString());
    }

    console.log("\n--- Checking Forecast Timestamps (Space Mountain) ---");
    const response = await fetch('https://api.themeparks.wiki/v1/entity/7340550b-c14d-4def-80bb-acdb51d49a66/live');
    const data = await response.json();
    const spaceMountain = data.liveData.find(r => r.name === 'Space Mountain');
    if (spaceMountain && spaceMountain.forecast) {
        console.log(`Forecast items: ${spaceMountain.forecast.length}`);
        console.log("First forecast item:", spaceMountain.forecast[0].time, "->", new Date(spaceMountain.forecast[0].time).toLocaleString());
        console.log("Last forecast item:", spaceMountain.forecast[spaceMountain.forecast.length - 1].time, "->", new Date(spaceMountain.forecast[spaceMountain.forecast.length - 1].time).toLocaleString());

        console.log("\nCurrent local time ('now'):", new Date().toLocaleString());
    } else {
        console.log("No forecast data found for Space Mountain");
    }
}

checkData();
