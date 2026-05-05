import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Ride } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate distance between two coordinates using Haversine formula (returns meters)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

export function estimateWalkTimeMinutes(distanceMeters: number): number {
    // Average walking speed in a crowded theme park is ~1.2 meters per second
    const walkSpeedMPS = 1.2;
    const seconds = distanceMeters / walkSpeedMPS;
    return Math.ceil(seconds / 60);
}

// Calculates current wait minus forecasted wait. Negative means shorter wait than usual.
export function getWaitTimeDelta(ride: Ride): number | null {
    if (ride.status !== "OPERATING" || typeof ride.queue?.STANDBY?.waitTime !== 'number') {
        return null;
    }
    const currentWait = ride.queue.STANDBY.waitTime;
    
    if (!ride.forecast || ride.forecast.length === 0) return null;
    
    const nowTime = new Date().getTime();
    let closestForecast = ride.forecast[0];
    let minDiff = Math.abs(new Date(closestForecast.time).getTime() - nowTime);
    
    for (let i = 1; i < ride.forecast.length; i++) {
        const diff = Math.abs(new Date(ride.forecast[i].time).getTime() - nowTime);
        if (diff < minDiff) {
            minDiff = diff;
            closestForecast = ride.forecast[i];
        }
    }
    
    // Only use if the forecast is within 1 hour
    if (minDiff > 60 * 60 * 1000) return null;
    
    return currentWait - closestForecast.waitTime;
}
