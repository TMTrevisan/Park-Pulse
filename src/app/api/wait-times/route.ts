import { NextResponse } from 'next/server';
import { getWaitTimes, getHistory } from '@/lib/data-service';
import type { ResortId } from '@/lib/parks';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeHistory = searchParams.get('history') !== 'false';
        const resort = (searchParams.get('resort') || 'DLR') as ResortId;
        
        const data = await getWaitTimes(includeHistory, resort);
        return NextResponse.json(data);
    } catch (error: any) {
        logger.error("api:wait-times", "Failed to fetch dashboard wait times", error);
        return NextResponse.json({ error: 'Failed to fetch wait times', details: error.message }, { status: 500 });
    }
}
