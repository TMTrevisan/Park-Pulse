import { NextResponse } from "next/server";
import { trimHistory } from "@/lib/data-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const [DLR, WDW] = await Promise.all([trimHistory('DLR'), trimHistory('WDW')]);
        return NextResponse.json({ success: true, DLR, WDW });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown cron error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
