import { CrowdCalendarView } from "@/components/calendar/CrowdCalendarView";
import { HeaderToolbar } from "@/components/dashboard/HeaderToolbar";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
    title: "Crowd Calendar | Park Pulse",
    description: "Plan your trip with our Disneyland crowd calendar",
};

export default function CalendarPage() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto mb-6">
                <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-800 rounded-xl border border-gray-200 dark:border-white/10 transition-colors backdrop-blur-xl">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </div>
            <CrowdCalendarView />
        </main>
    );
}
