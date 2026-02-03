import { getWaitTimes } from "@/lib/data-service";
import { Dashboard } from "@/components/Dashboard";

export const dynamic = "force-dynamic"; // Ensure this page is not statically cached

export default async function Home() {
    let initialData = null;
    let error = null;

    try {
        initialData = await getWaitTimes();
    } catch (e) {
        console.error("Failed to fetch initial data", e);
        error = "Failed to load wait times. Please try again later.";
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            <Dashboard initialData={initialData} error={error} />
        </main>
    );
}
