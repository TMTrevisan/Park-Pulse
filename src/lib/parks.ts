import RIDE_COORDS_DATA from './ride-coords.json';

export type ResortId = 'DLR' | 'WDW';

// ─── Resort Definitions ──────────────────────────────────────────────────────

export const RESORTS: Record<ResortId, { name: string; shortName: string; parks: string[] }> = {
    DLR: {
        name: 'Disneyland Resort',
        shortName: 'Disneyland',
        parks: ['7340550b-c14d-4def-80bb-acdb51d49a66', '832fcd51-ea19-4e77-85c7-75d5843b127c'],
    },
    WDW: {
        name: 'Walt Disney World Resort',
        shortName: 'Disney World',
        parks: [
            '75ea578a-adc8-4116-a54d-dccb60765ef9', // Magic Kingdom
            '47f90d2c-e191-4239-a466-5892ef59a88b', // EPCOT
            '288747d1-8b4f-4a64-867e-ea7c9b27bad8', // Hollywood Studios
            '1c84a229-8862-4648-9c71-378ddd2c7693'  // Animal Kingdom
        ],
    },
};

// ─── Park IDs ────────────────────────────────────────────────────────────────

export const PARKS = {
    DISNEYLAND_PARK: '7340550b-c14d-4def-80bb-acdb51d49a66',
    DISNEY_CALIFORNIA_ADVENTURE: '832fcd51-ea19-4e77-85c7-75d5843b127c',
    MAGIC_KINGDOM: '75ea578a-adc8-4116-a54d-dccb60765ef9',
    EPCOT: '47f90d2c-e191-4239-a466-5892ef59a88b',
    HOLLYWOOD_STUDIOS: '288747d1-8b4f-4a64-867e-ea7c9b27bad8',
    ANIMAL_KINGDOM: '1c84a229-8862-4648-9c71-378ddd2c7693',
};

export const RESORT_PARKS: Record<ResortId, string[]> = {
    DLR: [PARKS.DISNEYLAND_PARK, PARKS.DISNEY_CALIFORNIA_ADVENTURE],
    WDW: [PARKS.MAGIC_KINGDOM, PARKS.EPCOT, PARKS.HOLLYWOOD_STUDIOS, PARKS.ANIMAL_KINGDOM],
};

export const PARK_NAMES: Record<string, string> = {
    [PARKS.DISNEYLAND_PARK]: 'Disneyland Park',
    [PARKS.DISNEY_CALIFORNIA_ADVENTURE]: 'California Adventure',
    [PARKS.MAGIC_KINGDOM]: 'Magic Kingdom',
    [PARKS.EPCOT]: 'EPCOT',
    [PARKS.HOLLYWOOD_STUDIOS]: 'Hollywood Studios',
    [PARKS.ANIMAL_KINGDOM]: 'Animal Kingdom',
};

// ─── Ride Metadata Registry (Mapping ID to Name) ───────────────────────────
// Required for historical data expansion in data-service.ts

const rawCoords = (RIDE_COORDS_DATA as any).default || RIDE_COORDS_DATA;
export const RIDE_METADATA_REGISTRY: Record<string, string> = Object.entries(rawCoords).reduce(
    (acc, [id, data]: [string, any]) => ({ ...acc, [id]: data.name }),
    {}
);

// ─── Land Centroids for Map Navigation ───────────────────────────────────────

export const LAND_CENTROIDS: Record<string, { lat: number; lng: number; zoom: number }> = {
    'Main Street, U.S.A.': { lat: 28.4173, lng: -81.5812, zoom: 17.5 },
    'Adventureland': { lat: 28.4182, lng: -81.5840, zoom: 17.5 },
    'Frontierland': { lat: 28.4195, lng: -81.5835, zoom: 17.5 },
    'Liberty Square': { lat: 28.4200, lng: -81.5825, zoom: 17.5 },
    'Fantasyland': { lat: 28.4215, lng: -81.5810, zoom: 17.2 },
    'Tomorrowland': { lat: 28.4185, lng: -81.5785, zoom: 17.2 },
    'World Celebration': { lat: 28.3750, lng: -81.5490, zoom: 17.0 },
    'World Nature': { lat: 28.3750, lng: -81.5510, zoom: 17.0 },
    'World Discovery': { lat: 28.3750, lng: -81.5470, zoom: 17.0 },
    'World Showcase': { lat: 28.3690, lng: -81.5490, zoom: 16.0 },
    'Galaxy\'s Edge': { lat: 28.3550, lng: -81.5620, zoom: 17.5 },
    'Toy Story Land': { lat: 28.3565, lng: -81.5605, zoom: 17.5 },
    'Pandora': { lat: 28.3560, lng: -81.5920, zoom: 17.5 },
    'Africa': { lat: 28.3600, lng: -81.5900, zoom: 17.0 },
    'Asia': { lat: 28.3590, lng: -81.5870, zoom: 17.0 },
    'New Orleans Square': { lat: 33.8110, lng: -117.9220, zoom: 18.0 },
    'Critter Country': { lat: 33.8125, lng: -117.9230, zoom: 18.0 },
    'Toontown': { lat: 33.8155, lng: -117.9185, zoom: 17.5 },
    'Avengers Campus': { lat: 33.8075, lng: -117.9200, zoom: 18.0 },
};

// ─── Land Mapping ────────────────────────────────────────────────────────────

const BASE_LAND_MAPPING: Record<string, string> = {
    'Star Wars: Rise of the Resistance': "Galaxy's Edge",
    'Millennium Falcon: Smugglers Run': "Galaxy's Edge",
    'Big Thunder Mountain Railroad': 'Frontierland',
    'Jungle Cruise': 'Adventureland',
    "it's a small world": 'Fantasyland',
    'Dumbo the Flying Elephant': 'Fantasyland',
    'Mad Tea Party': 'Fantasyland',
    "Peter Pan's Flight": 'Fantasyland',
    'Tomorrowland Speedway': 'Tomorrowland',
    'Seven Dwarfs Mine Train': 'Fantasyland',
    "Mickey & Minnie's Runaway Railway": 'Toontown',
    'Astro Orbitor': 'Tomorrowland',
    'Slinky Dog Dash': 'Toy Story Land',
    'Toy Story Mania!': 'Toy Story Land',
    "Soarin' Around the World": 'World Nature',
    'Expedition Everest': 'Asia',
    'Avatar Flight of Passage': 'Pandora',
    'Spaceship Earth': 'World Celebration',
};

export const RESORT_LAND_OVERRIDES: Record<ResortId, Record<string, string>> = {
    DLR: {
        'Haunted Mansion': 'New Orleans Square',
        'Pirates of the Caribbean': 'New Orleans Square',
        'Space Mountain': 'Tomorrowland',
        'Star Tours': 'Tomorrowland',
        'Splash Mountain': 'Critter Country',
        'Matterhorn Bobsleds': 'Fantasyland',
        'Indiana Jones': 'Adventureland',
    },
    WDW: {
        'Haunted Mansion': 'Liberty Square',
        'Pirates of the Caribbean': 'Adventureland',
        'Space Mountain': 'Tomorrowland',
        'Star Tours': 'Echo Lake',
        'The Barnstormer': 'Fantasyland',
        'Buzz Lightyear\'s Space Ranger Spin': 'Tomorrowland',
        'Country Bear Musical Jamboree': 'Frontierland',
        'Under the Sea ~ Journey of The Little Mermaid': 'Fantasyland',
        'Mickey\'s PhilharMagic': 'Fantasyland',
        'The Many Adventures of Winnie the Pooh': 'Fantasyland',
        'TRON Lightcycle / Run': 'Tomorrowland',
        'The Magic Carpets of Aladdin': 'Adventureland',
        'Prince Charming Regal Carrousel': 'Fantasyland',
        'The Hall of Presidents': 'Liberty Square',
        'Monsters Inc. Laugh Floor': 'Tomorrowland',
        'Liberty Square Riverboat': 'Liberty Square',
        'Frozen Ever After': 'World Showcase',
        'Remy\'s Ratatouille Adventure': 'World Celebration',
        'Kilimanjaro Safaris': 'Africa',
    }
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function getLand(rideName: string, resort: ResortId): string {
    const overrides = RESORT_LAND_OVERRIDES[resort];
    if (overrides[rideName]) return overrides[rideName];
    if (BASE_LAND_MAPPING[rideName]) return BASE_LAND_MAPPING[rideName];
    const ok = Object.keys(overrides).find(k => rideName.includes(k));
    if (ok) return overrides[ok];
    const bk = Object.keys(BASE_LAND_MAPPING).find(k => rideName.includes(k));
    if (bk) return BASE_LAND_MAPPING[bk];
    return '—';
}

export function getTicketClass(rideName: string, resort: ResortId): string {
    const baseTickets: Record<string, string> = {
        'Rise of the Resistance': 'E', 'Avatar Flight of Passage': 'E', 'TRON': 'E', 'Space Mountain': 'E',
        'Guardians': 'E', 'Slinky Dog': 'E', 'Radiator Springs': 'E', 'Seven Dwarfs': 'E',
        'Pirates': 'D', 'Haunted Mansion': 'D', 'Big Thunder': 'D', 'Indiana Jones': 'D',
        'Jungle Cruise': 'D', 'Splash Mountain': 'D', 'Soarin': 'D', 'Frozen Ever After': 'D',
        'Peter Pan': 'D', 'Small World': 'C', 'Pooh': 'C', 'Buzz Lightyear': 'C',
    };
    const match = Object.keys(baseTickets).find(k => rideName.includes(k));
    return match ? baseTickets[match] : '—';
}

export function getDefaultParkForResort(resort: ResortId): string {
    return RESORT_PARKS[resort][0];
}
