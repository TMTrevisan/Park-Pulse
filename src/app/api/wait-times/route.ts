import { NextResponse } from 'next/server';
import { getWaitTimes, getHistory } from '@/lib/data-service';
import type { ResortId } from '@/lib/parks';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeHistory = searchParams.get('history') !== 'false';
        const resort = (searchParams.get('resort') || 'DLR') as ResortId;
        
        // Add debug info to see if redis is reachable
        let debugHistoryError = null;
        try {
            await getHistory(resort);
        } catch (err: any) {
            debugHistoryError = err.message;
        }

        const data = await getWaitTimes(includeHistory, resort);
        return NextResponse.json({ ...data, debugHistoryError });
    } catch (error: any) {
        console.error("Error in /api/wait-times:", error);
        return NextResponse.json({ error: 'Failed to fetch wait times', details: error.message }, { status: 500 });
    }
}
