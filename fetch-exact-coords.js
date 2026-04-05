const fs = require('fs');

async function main() {
    // 7340550b-c14d-4def-80bb-acdb51d49a66 is the Disneyland RESORT ID which includes both parks
    const resortId = "7340550b-c14d-4def-80bb-acdb51d49a66";
    const dcaParkIdFallback = "0df49a66-7340-4def-80bb-acdb51d49a66";

    const newCoords = {};

    // Base manual coords for the parks themselves
    newCoords[resortId] = { lat: 33.8121, lng: -117.9190, name: "Disneyland Park" };
    newCoords[dcaParkIdFallback] = { lat: 33.8061, lng: -117.9190, name: "Disney California Adventure" };

    try {
        const response = await fetch(`https://api.themeparks.wiki/v1/entity/${resortId}/children`);
        const data = await response.json();
        
        let matchCount = 0;
        data.children.forEach(child => {
            if (child.location && child.location.latitude && child.location.longitude) {
                newCoords[child.id] = {
                    lat: child.location.latitude,
                    lng: child.location.longitude,
                    name: child.name
                };
                matchCount++;
            }
        });
        console.log(`Found ${matchCount} exact coordinate matches for resort ${resortId}`);
    } catch(err) {
        console.error("Fetch failed", err);
    }

    const output = `export const RIDE_COORDS: Record<string, { lat: number, lng: number, name: string }> = ${JSON.stringify(newCoords, null, 2)};`;
    fs.writeFileSync('./src/lib/ride-coords.ts', output);
    console.log("Wrote exact GPS coordinates to src/lib/ride-coords.ts");
}

main().catch(console.error);
