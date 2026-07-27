import { NextResponse } from 'next/server';
import { getParkCatalog } from '@/lib/park-providers';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        return NextResponse.json({ parks: await getParkCatalog() });
    } catch (error) {
        logger.error('api:parks', 'Failed to load park catalog', error);
        return NextResponse.json({ error: 'Failed to load park catalog' }, { status: 502 });
    }
}
