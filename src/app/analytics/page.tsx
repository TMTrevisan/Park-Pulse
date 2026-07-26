import type { ResortId } from "@/lib/parks";
import { getHistory } from "@/lib/data-service";
import AnalyticsDashboard from "./AnalyticsDashboard";
import type { AnalyticsTimelinePoint } from "@/components/analytics/ComparativeTimeline";

export const dynamic = 'force-dynamic';

function parseResort(resort: string | undefined): ResortId {
    return resort === 'WDW' ? 'WDW' : 'DLR';
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ resort?: string }> }) {
    const { resort: resortParam } = await searchParams;
    const resort = parseResort(resortParam);
    // getHistory returns the raw snapshot array containing info for all parks
    const history = await getHistory(resort);

    const timelineData = history.map(snap => {
        const pointData: AnalyticsTimelinePoint = { time: snap.timestamp };

        snap.parks.forEach(park => {
            if (park.liveData) {
                park.liveData.forEach(ride => {
                    pointData[ride.id] = (typeof ride.queue?.STANDBY?.waitTime === 'number') 
                        ? ride.queue.STANDBY.waitTime 
                        : null;
                });
            }
        });

        return pointData;
    });

    // We also need a lightweight dictionary of ride dict for the multi-select UI
    const ridesMeta: Record<string, { name: string, parkId: string }> = {};
    const lastSnap = history[history.length - 1];
    
    if (lastSnap) {
        lastSnap.parks.forEach(park => {
            if (park.liveData) {
                park.liveData.forEach(r => {
                    ridesMeta[r.id] = { name: r.name, parkId: park.id };
                });
            }
        });
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 selection:bg-purple-500/30">
            <AnalyticsDashboard data={timelineData} ridesMeta={ridesMeta} resort={resort} />
        </div>
    );
}
