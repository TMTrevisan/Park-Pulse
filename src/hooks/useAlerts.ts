"use client";

import { useState, useEffect, useCallback } from "react";
import { Ride } from "@/lib/types";

export interface Alert {
    rideId: string;
    threshold: number; // Notification trigger if waitTime <= threshold
    rideName: string;
}

export function useAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [permission, setPermission] = useState<NotificationPermission>("default");

    // Load alerts from storage on mount
    useEffect(() => {
        const stored = localStorage.getItem("disney-alerts");
        if (stored) {
            try {
                setAlerts(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse alerts", e);
            }
        }

        if ("Notification" in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (!("Notification" in window)) {
            console.warn("This browser does not support desktop notifications");
            return;
        }
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
    }, []);

    const addAlert = useCallback((rideId: string, rideName: string, threshold: number) => {
        setAlerts(prev => {
            const exists = prev.find(a => a.rideId === rideId);
            if (exists) {
                // Update existing
                const updated = prev.map(a => a.rideId === rideId ? { rideId, rideName, threshold } : a);
                localStorage.setItem("disney-alerts", JSON.stringify(updated));
                return updated;
            }
            // Add new
            const updated = [...prev, { rideId, rideName, threshold }];
            localStorage.setItem("disney-alerts", JSON.stringify(updated));
            return updated;
        });

        if (permission === 'default') {
            requestPermission();
        }
    }, [permission, requestPermission]);

    const removeAlert = useCallback((rideId: string) => {
        setAlerts(prev => {
            const updated = prev.filter(a => a.rideId !== rideId);
            localStorage.setItem("disney-alerts", JSON.stringify(updated));
            return updated;
        });
    }, []);

    const checkAlerts = useCallback((rides: Ride[]) => {
        if (permission !== "granted") return;

        rides.forEach(ride => {
            const alertSetting = alerts.find(a => a.rideId === ride.id);
            if (!alertSetting) return;

            const waitTime = ride.queue?.STANDBY?.waitTime ?? null;
            if (waitTime !== null && waitTime <= alertSetting.threshold) {
                // Check if we already notified recently? (Simplification: just notify)
                // In production, we'd store "lastNotified" timestamp to avoid spam.

                // For this MVP, we rely on the user removing the alert or us checking a "lastNotified" state 
                // but let's just trigger it. To avoid spam loop, maybe we remove it after firing?
                // Or better: Use a simple debounce/timeout in the component calling this.

                new Notification(`Wait Time Alert: ${ride.name}`, {
                    body: `${ride.name} is now ${waitTime} minutes! (Target: ${alertSetting.threshold}m)`,
                    icon: '/icon.png' // Optional
                });
            }
        });
    }, [alerts, permission]);

    return {
        alerts,
        addAlert,
        removeAlert,
        checkAlerts,
        permission,
        requestPermission
    };
}
