import { NextResponse } from 'next/server';
import { getWaitTimes } from '@/lib/data-service';
import type { ResortId } from '@/lib/parks';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeHistory = searchParams.get('history') !== 'false';
        const resort = (searchParams.get('resort') || 'DLR') as ResortId;

        const data = await getWaitTimes(includeHistory, resort);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in /api/wait-times:", error);
        return NextResponse.json({ error: 'Failed to fetch wait times' }, { status: 500 });
    }
}
