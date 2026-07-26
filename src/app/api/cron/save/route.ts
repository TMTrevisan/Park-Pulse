import { NextResponse } from "next/server";
import { fetchAndSaveSnapshot } from "@/lib/data-service";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        logger.warn('cron:save', 'Unauthorized cron execution attempt', { hasAuthorization: Boolean(authHeader) });
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const resultDLR = await fetchAndSaveSnapshot('DLR');
        const resultWDW = await fetchAndSaveSnapshot('WDW');
        return NextResponse.json({ success: true, DLR: resultDLR, WDW: resultWDW });
    } catch (error) {
        logger.error('cron:save', 'Cron execution failed', error);
        const message = error instanceof Error ? error.message : 'Unknown cron error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
