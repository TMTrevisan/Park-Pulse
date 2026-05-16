import { Redis } from '@upstash/redis';

// Only instantiate Redis if environment variables exist
const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
    })
    : null;

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    context: string;
    message: string;
    details?: any;
}

export const logger = {
    async log(level: LogLevel, context: string, message: string, details?: any) {
        // Always output to standard console for Vercel logs
        if (level === 'error') console.error(`[${context}] ${message}`, details || '');
        else if (level === 'warn') console.warn(`[${context}] ${message}`, details || '');
        else console.log(`[${context}] ${message}`, details || '');

        if (!redis) return;

        try {
            const entry: LogEntry = {
                timestamp: new Date().toISOString(),
                level,
                context,
                message,
                details: details instanceof Error ? details.stack : (details ? JSON.stringify(details) : undefined),
            };

            // Push to Redis list and trim to keep only the latest 1000 logs
            await redis.lpush('parkpulse:logs', JSON.stringify(entry));
            await redis.ltrim('parkpulse:logs', 0, 999);
        } catch (e) {
            console.error('Failed to write telemetry to Redis log', e);
        }
    },
    info: (context: string, message: string, details?: any) => logger.log('info', context, message, details),
    warn: (context: string, message: string, details?: any) => logger.log('warn', context, message, details),
    error: (context: string, message: string, details?: any) => logger.log('error', context, message, details),
};
