"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Ride } from "@/lib/types";

export interface Alert {
    rideId: string;
    threshold: number; // Notification trigger if waitTime <= threshold
    rideName: string;
}

const NOTIFICATION_COOLDOWN_MS = 30 * 60 * 1000;
const NOTIFICATION_STORAGE_KEY = "disney-alert-last-notified";

export function useAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const lastNotifiedAt = useRef<Record<string, number>>({});

    // Load alerts from storage on mount
    useEffect(() => {
        const stored = localStorage.getItem("disney-alerts");
        if (stored) {
            try {
                // This initializes client-only persisted state after hydration.
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setAlerts(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse alerts", e);
            }
        }

        if ("Notification" in window) {
            setPermission(Notification.permission);
        }

        const storedNotifications = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
        if (storedNotifications) {
            try {
                lastNotifiedAt.current = JSON.parse(storedNotifications);
            } catch (e) {
                console.error("Failed to parse alert notification history", e);
            }
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
                const now = Date.now();
                const lastNotification = lastNotifiedAt.current[ride.id] || 0;
                if (now - lastNotification < NOTIFICATION_COOLDOWN_MS) return;

                new Notification(`Wait Time Alert: ${ride.name}`, {
                    body: `${ride.name} is now ${waitTime} minutes! (Target: ${alertSetting.threshold}m)`,
                    icon: '/icon.png' // Optional
                });
                lastNotifiedAt.current[ride.id] = now;
                localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(lastNotifiedAt.current));
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
