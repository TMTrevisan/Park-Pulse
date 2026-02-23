const { Redis } = require('@upstash/redis');
const fs = require('fs');
const path = require('path');

async function fetchParkData(parkId) {
    const response = await fetch(`https://api.themeparks.wiki/v1/entity/${parkId}/live`);
    return response.json();
}

async function checkStatus() {
    console.log("Fetching live data...");
    const DISNEYS_LAND_ID = "7340550b-c14d-4def-80bb-acdb51d49a66";

    try {
        const data = await fetchParkData(DISNEYS_LAND_ID);
        const rides = data.liveData;

        const operatingRides = rides.filter((r) =>
            r.entityType === "ATTRACTION" &&
            r.status === "OPERATING" &&
            r.queue && r.queue.STANDBY && r.queue.STANDBY.waitTime !== undefined && r.queue.STANDBY.waitTime !== null
        );

        if (!operatingRides.length) {
            console.log("No operating rides found.");
            return;
        }

        const totalWait = operatingRides.reduce(
            (acc, ride) => acc + (ride.queue.STANDBY.waitTime || 0),
            0
        );
        const averageWaitTime = Math.round(totalWait / operatingRides.length);

        console.log(`\n--- Park Status Check ---`);
        console.log(`Operating Rides: ${operatingRides.length}`);
        console.log(`Total Wait Time: ${totalWait} min`);
        console.log(`Average Wait: ${averageWaitTime} min`);

        let status = "Unknown";
        if (averageWaitTime < 15) status = "Quiet";
        else if (averageWaitTime < 30) status = "Moderate";
        else if (averageWaitTime < 50) status = "Busy";
        else status = "Very Busy";

        console.log(`Calculated Status: ${status}`);

        console.log("\nTop 5 Longest Waits:");
        operatingRides.sort((a, b) => b.queue.STANDBY.waitTime - a.queue.STANDBY.waitTime);
        operatingRides.slice(0, 5).forEach(r => {
            console.log(`- ${r.name}: ${r.queue.STANDBY.waitTime} min`);
        });

    } catch (e) {
        console.error("Error:", e);
    }
}

checkStatus();
