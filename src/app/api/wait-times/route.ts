import { NextResponse } from 'next/server';
import { getWaitTimes } from '@/lib/data-service';

export const revalidate = 60; // Cache response on edge for 60 seconds

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeHistory = searchParams.get('history') !== 'false';

        const data = await getWaitTimes(includeHistory);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in /api/wait-times:", error);
        return NextResponse.json({ error: 'Failed to fetch wait times' }, { status: 500 });
    }
}
