# Park Pulse: Agent Context & Architecture Guide

Welcome to the Park Pulse codebase. This document is specifically designed to provide context, architectural rules, and gotchas for autonomous AI agents or new developers working on this project. 

## 🏗️ Core Architecture
This project is built using the **Next.js App Router (React 19)**, **Tailwind CSS**, and **Upstash Redis**.
*   **Routing**: Standard Next.js `/app` router. API routes are in `/src/app/api/`.
*   **Data Flow**:
    1.  A cron job pings `/api/cron/save` every minute.
    2.  The backend (`src/lib/data-service.ts`) fetches live data from `ThemeParks.wiki`, compresses it into a `CompactSnapshot`, and pushes it to Upstash Redis (`wait_times_history_<resort>`).
    3.  The frontend client requests `/api/wait-times?history=true`. The backend pulls all data from Redis, **downsamples** it, and expands it back into full `WaitTimeSnapshot` objects.

## 🚨 Critical Edge Cases & Limitations (DO NOT REGRESS)

When modifying `src/lib/data-service.ts` or fetching data, be aware of the following hard limits:
1.  **Upstash 10MB Limit**: Upstash REST API crashes if a response exceeds 10MB. 7 days of 1-minute historical data exceeds this limit. Therefore, `getHistory` **must** fetch data in chunks of 2,000 using `redis.lrange()`.
2.  **Vercel Serverless 4.5MB Limit**: Next.js API routes will crash if the JSON payload sent to the client exceeds 4.5MB. We mitigate this using a downsampling strategy in `getHistory`:
    *   Last 24 hours: 15-minute resolution.
    *   Older than 24 hours: 60-minute resolution.
    *   *Rule*: Do NOT alter this downsampling logic without verifying payload sizes, or the dashboard will fail to load in production.

## 🎨 UI/UX Design Standards
The application aims to be an ultra-premium, high-end analytics tool.
*   **Aesthetics**: The UI heavily relies on a **Dark Mode Glassmorphism** design. 
    *   Use Tailwind classes like `bg-gray-900/80 backdrop-blur-md border-gray-700` for panels.
    *   Avoid default white tooltips. Recharts tooltips must be styled explicitly for dark mode to ensure text legibility.
*   **Timezones & Hydration**:
    *   Theme parks operate in specific time zones (`America/Los_Angeles` or `America/New_York`).
    *   *Rule*: NEVER use standard `new Date().getHours()` for grouping heatmap or chart data. It will use the local browser time and shift data incorrectly for users in different time zones. Always use `Intl.DateTimeFormat` with the `timeZone` option mapped from `PARK_TIMEZONES`.
    *   *Rule*: When dealing with time localization in components (like `RideHeatmap.tsx`), always wrap the component logic in a `useEffect` hydration check (`if (!isMounted) return null;`) to prevent React server-client hydration mismatches.

## 🛠️ Folder Structure
*   `/src/app`: Next.js routing and API endpoints.
*   `/src/components/dashboard`: Core UI components (Tables, Heatmaps, Charts, Maps).
*   `/src/lib`: Core business logic.
    *   `parks.ts`: Static mapping of park IDs, ride names, map coordinates, and timezones.
    *   `data-service.ts`: Heavy lifting for Redis interaction, data compression, and downsampling.
    *   `logger.ts`: The centralized telemetry system.
*   `/scripts`: Internal CLI tools.
    *   `view-logs.mjs`: Connects to Redis to read internal server errors and cron execution logs.

## 📡 Telemetry & Logging
Do not use `console.error` for critical backend failures (like external API rate limits or Cron execution failures). Use the custom logger:
```typescript
import { logger } from '@/lib/logger';
logger.error('context:name', 'Description', errorObject);
```
Logs are saved in the Redis list `parkpulse:logs`. Agents can run `node scripts/view-logs.mjs` via the terminal to inspect system health programmatically.

## 🧪 Testing
There is a Vitest regression suite located at `src/lib/data-service.test.ts`. If you modify data parsing logic or downsampling thresholds, run `npx vitest run` to ensure you haven't broken the pipeline.
