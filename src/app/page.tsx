import { Dashboard } from "@/components/Dashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const dynamic = "force-dynamic"; // Ensure this page is not statically cached

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            <ErrorBoundary>
                <Dashboard />
            </ErrorBoundary>
        </main>
    );
}
