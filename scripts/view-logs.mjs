import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (!url || !token) {
    console.error('Error: KV_REST_API_URL and KV_REST_API_TOKEN must be set in .env.local');
    process.exit(1);
}

const redis = new Redis({ url, token });

async function viewLogs() {
    const action = process.argv[2] || 'tail'; // tail or clear

    if (action === 'clear') {
        await redis.del('parkpulse:logs');
        console.log('✅ Telemetry logs cleared.');
        return;
    }

    const count = parseInt(process.argv[3] || '20', 10);
    const logs = await redis.lrange('parkpulse:logs', 0, count - 1);

    if (!logs || logs.length === 0) {
        console.log('✅ No logs found in Redis.');
        return;
    }

    console.log(`\n=== 📊 LAST ${logs.length} TELEMETRY LOGS ===\n`);
    logs.reverse().forEach((logStr, index) => {
        try {
            const entry = typeof logStr === 'string' ? JSON.parse(logStr) : logStr;
            const levelIcon = entry.level === 'error' ? '🔴' : entry.level === 'warn' ? '🟡' : '🔵';
            console.log(`[${entry.timestamp}] ${levelIcon} ${entry.level.toUpperCase()} [${entry.context}]`);
            console.log(`    Message: ${entry.message}`);
            if (entry.details) {
                console.log(`    Details: ${entry.details.length > 500 ? entry.details.substring(0, 500) + '...' : entry.details}`);
            }
            console.log('-'.repeat(60));
        } catch (e) {
            console.log(`[Parse Error] ${logStr}`);
        }
    });
}

viewLogs().catch(console.error);
