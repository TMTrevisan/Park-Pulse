"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export class ErrorBoundary extends Component<{ children: ReactNode, fallback?: ReactNode }, { hasError: boolean, error?: Error }> {
    constructor(props: { children: ReactNode, fallback?: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <div className="flex flex-col items-center justify-center p-6 text-center bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 h-full">
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="font-bold text-red-700 dark:text-red-400 mb-2">Something went wrong.</h3>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4 max-w-sm">
                        {this.state.error?.message || "An unexpected error occurred while loading this component."}
                    </p>
                    <button 
                        onClick={() => this.setState({ hasError: false })}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-100 rounded-lg font-medium transition-colors text-sm"
                    >
                        <RefreshCcw className="w-4 h-4" /> Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
