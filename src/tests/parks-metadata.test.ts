import { describe, expect, it } from "vitest";
import { getLand, getTicketClass, resolveRideMetadata } from "@/lib/parks";

describe("ride metadata mapping", () => {
    it("resolves known Disneyland attractions", () => {
        expect(getLand("Haunted Mansion", "DLR", "ride-1")).toBe("New Orleans Square");
        expect(getTicketClass("Indiana Jones Adventure", "DLR", "ride-2")).toBe("E");
    });

    it("resolves known Walt Disney World attractions", () => {
        expect(getLand("Space Mountain", "WDW", "ride-3")).toBe("Tomorrowland");
        expect(getTicketClass("Kilimanjaro Safaris", "WDW", "ride-4")).toBe("D");
    });

    it("always returns a non-empty land and ticket for unknown attractions", () => {
        const land = getLand("Completely Unknown Ride Name", "WDW", "unknown");
        const ticket = getTicketClass("Completely Unknown Ride Name", "WDW", "unknown");

        expect(land.length).toBeGreaterThan(0);
        expect(land).not.toBe("—");
        expect(ticket).toMatch(/^[ABCDE]$/);
    });

    it("reports an authoritative source for canonical ride-ID metadata", () => {
        const metadata = resolveRideMetadata({
            rideId: "9167db1d-e5e7-46da-a07f-ae30a87bc4c4",
            name: "Renamed Ride",
            resort: "DLR",
        });

        expect(metadata).toMatchObject({
            land: "Tomorrowland",
            ticketClass: "E",
            source: "id_override",
            confidence: "high",
        });
    });

    it("reports low-confidence default resolution for unknown attractions", () => {
        const metadata = resolveRideMetadata({
            name: "Completely Unknown Ride Name",
            resort: "WDW",
        });

        expect(metadata).toMatchObject({
            land: "Walt Disney World Area",
            ticketClass: "C",
            source: "default",
            confidence: "low",
        });
    });
});
