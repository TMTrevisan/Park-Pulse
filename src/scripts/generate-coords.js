/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const https = require('https');

const PARKS = [
    '7340550b-c14d-4def-80bb-acdb51d49a66', // Disneyland
    '832fcd51-ea19-4e77-85c7-75d5843b127c', // DCA
    '75ea578a-adc8-4116-a54d-dccb60765ef9', // MK
    '47f90d2c-e191-4239-a466-5892ef59a88b', // Epcot
    '288747d1-8b4f-4a64-867e-ea7c9b27bad8', // HS
    '1c84a229-8862-4648-9c71-378ddd2c7693'  // AK
];

async function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    const coordsMap = {};

    for (const parkId of PARKS) {
        console.log(`Fetching park ${parkId}...`);
        try {
            const data = await fetchJSON(`https://api.themeparks.wiki/v1/entity/${parkId}/children`);
            if (data && data.children) {
                for (const child of data.children) {
                    if (child.location && child.location.latitude && child.location.longitude) {
                        coordsMap[child.id] = {
                            lat: child.location.latitude,
                            lng: child.location.longitude,
                            name: child.name
                        };
                    }
                }
            }
        } catch (e) {
            console.error(`Error fetching ${parkId}:`, e.message);
        }
    }

    fs.writeFileSync('./src/lib/ride-coords.json', JSON.stringify(coordsMap, null, 2));
    console.log(`Wrote ${Object.keys(coordsMap).length} ride coordinates to src/lib/ride-coords.json`);
}

main();
