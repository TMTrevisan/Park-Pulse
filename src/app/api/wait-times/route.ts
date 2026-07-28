import { NextResponse } from 'next/server';
import { getWaitTimes } from '@/lib/data-service';
import { getUniversalParkWaitTimes } from '@/lib/park-providers';
import type { ParkProviderId } from '@/lib/park-providers';
import type { ResortId } from '@/lib/parks';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeHistory = searchParams.get('history') !== 'false';
        const provider = searchParams.get('provider');
        const parkId = searchParams.get('parkId');
        if (provider || parkId) {
            if ((provider !== 'themeparks' && provider !== 'queue-times') || !parkId) {
                return NextResponse.json({ error: 'provider (themeparks or queue-times) and parkId are required together.' }, { status: 400 });
            }
            return NextResponse.json(await getUniversalParkWaitTimes(provider as ParkProviderId, parkId));
        }
        const resortParam = searchParams.get('resort') || 'DLR';
        if (resortParam !== 'DLR' && resortParam !== 'WDW') {
            return NextResponse.json({ error: 'Invalid resort. Expected DLR or WDW.' }, { status: 400 });
        }
        const resort: ResortId = resortParam;
        
        const data = await getWaitTimes(includeHistory, resort);
        return NextResponse.json(data);
    } catch (error) {
        logger.error("api:wait-times", "Failed to fetch dashboard wait times", error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to fetch wait times', details: message }, { status: 500 });
    }
}
