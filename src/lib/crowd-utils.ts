import crowdDataRaw from '../../data/crowd-calendar.json';

type CrowdDataRaw = Record<string, { tier: number; blockouts: string[]; events: string[] }>;
const crowdData = crowdDataRaw as CrowdDataRaw;

export type CrowdSeverity = 'Low' | 'Moderate' | 'Heavy' | 'Insane';

export interface CrowdMetrics {
    date: string;
    tier: number;
    blockouts: string[];
    events: string[];
    severity: CrowdSeverity;
    colorClass: string;
    score: number; // 0-100
}

export function getCrowdMetricsForDate(dateStr: string): CrowdMetrics {
    const data = crowdData[dateStr] || { tier: 3, blockouts: [], events: [] };
    
    // Calculate a rough score (0-100)
    // Tier 0-6 contributes 60% of the score (10 points per tier)
    let score = data.tier * 10;
    
    // Blockouts: if many passes are blocked out, it implies Disney EXPECTS it to be very busy.
    // So blockouts increase the expected severity.
    score += data.blockouts.length * 5;
    
    // Events: Grad Nites add significant evening crowds.
    if (data.events.includes('Grad Nite')) score += 15;
    if (data.events.includes("Father's Day") || data.events.includes("Fourth of July")) score += 20;

    score = Math.min(100, Math.max(0, score));

    let severity: CrowdSeverity = 'Low';
    let colorClass = 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    
    if (score >= 80) {
        severity = 'Insane';
        colorClass = 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30';
    } else if (score >= 60) {
        severity = 'Heavy';
        colorClass = 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
    } else if (score >= 40) {
        severity = 'Moderate';
        colorClass = 'bg-amber-500/20 text-amber-600 dark:text-amber-500 border-amber-500/30';
    }

    return {
        date: dateStr,
        ...data,
        severity,
        colorClass,
        score
    };
}

export function getCrowdCalendarDataForMonth(year: number, month: number): CrowdMetrics[] {
    const daysInMonth = new Date(year, month, 0).getDate();
    const metrics: CrowdMetrics[] = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        metrics.push(getCrowdMetricsForDate(dateStr));
    }
    
    return metrics;
}
