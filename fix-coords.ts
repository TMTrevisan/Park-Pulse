import { RIDE_COORDS } from './src/lib/ride-coords';
import * as fs from 'fs';

async function main() {
    const res = await fetch('http://localhost:3000/api/wait-times');
    const waitTimes = await res.json();

    const newCoords: Record<string, {lat: number, lng: number, name: string}> = {};

    const nameToCoords = new Map();
    for (const [id, data] of Object.entries(RIDE_COORDS)) {
        nameToCoords.set(data.name.toLowerCase(), data);
    }

    if (!waitTimes.current || !waitTimes.current.parks) {
        console.error("Invalid API response:", Object.keys(waitTimes));
        return;
    }

    waitTimes.current.parks.forEach((park: any) => {
        if (RIDE_COORDS[park.id]) {
            newCoords[park.id] = RIDE_COORDS[park.id];
        }

        if (park.liveData) {
            park.liveData.forEach((ride: any) => {
                const match = nameToCoords.get(ride.name.toLowerCase());
                if (match) {
                    newCoords[ride.id] = match;
                } else {
                    console.log("No coords found for:", ride.name);
                }
            });
        }
    });

    const output = `export const RIDE_COORDS: Record<string, { lat: number, lng: number, name: string }> = ${JSON.stringify(newCoords, null, 2)};`;
    fs.writeFileSync('./src/lib/ride-coords.ts', output);
    console.log("Wrote coordinates to src/lib/ride-coords.ts");
}

main();
