import { Dashboard } from "@/components/Dashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            <ErrorBoundary>
                <Dashboard />
            </ErrorBoundary>
        </main>
    );
}
