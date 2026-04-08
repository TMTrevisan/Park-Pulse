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
    'New Orleans Square': { lat: 33.8110, lng: -117.9220, zoom: 18.0 },
};

// ─── Massive Land Mapping (Fuzzy Support) ────────────────────────────────────

const BASE_LAND_MAPPING: Record<string, string> = {
    'Rise of the Resistance': "Galaxy's Edge",
    'Smugglers Run': "Galaxy's Edge",
    'Big Thunder': 'Frontierland',
    'Jungle Cruise': 'Adventureland',
    'small world': 'Fantasyland',
    'Dumbo': 'Fantasyland',
    'Mad Tea Party': 'Fantasyland',
    'Peter Pan': 'Fantasyland',
    'Tomorrowland Speedway': 'Tomorrowland',
    'Seven Dwarfs': 'Fantasyland',
    'Runaway Railway': 'Toontown',
    'Slinky Dog': 'Toy Story Land',
    'Toy Story Mania': 'Toy Story Land',
    'Soarin': 'World Nature',
    'Expedition Everest': 'Asia',
    'Flight of Passage': 'Pandora',
    'Spaceship Earth': 'World Celebration',
    'Test Track': 'World Discovery',
    'Frozen Ever After': 'World Showcase',
    'Ratatouille': 'World Showcase',
    'Tower of Terror': 'Sunset Boulevard',
    'Rock \'n\' Roller Coaster': 'Sunset Boulevard',
    'Barnstormer': 'Fantasyland',
    'Kilimanjaro Safaris': 'Africa',
    'DINOSAUR': 'DinoLand U.S.A.',
    'Kali River Rapids': 'Asia',
    'Living with the Land': 'World Nature',
    'Journey into Imagination': 'World Celebration',
};

export const RESORT_LAND_OVERRIDES: Record<ResortId, Record<string, string>> = {
    DLR: {
        'Haunted Mansion': 'New Orleans Square',
        'Pirates of the Caribbean': 'New Orleans Square',
        'Space Mountain': 'Tomorrowland',
        'Indiana Jones': 'Adventureland',
    },
    WDW: {
        'Haunted Mansion': 'Liberty Square',
        'Pirates of the Caribbean': 'Adventureland',
        'Space Mountain': 'Tomorrowland',
        'Star Tours': 'Echo Lake',
        'Cosmic Rewind': 'World Discovery',
        'Buzz Lightyear': 'Tomorrowland',
        'Under the Sea': 'Fantasyland',
        'Winnie the Pooh': 'Fantasyland',
        'TRON': 'Tomorrowland',
    }
};

// ─── Fuzzy Search Logic ──────────────────────────────────────────────────────

export function getLand(rideName: string, resort: ResortId): string {
    const name = rideName.toLowerCase();
    
    // 1. Resort Overrides
    const overrides = RESORT_LAND_OVERRIDES[resort];
    const overrideMatch = Object.keys(overrides).find(k => name.includes(k.toLowerCase()));
    if (overrideMatch) return overrides[overrideMatch];
    
    // 2. Base Mapping
    const baseMatch = Object.keys(BASE_LAND_MAPPING).find(k => name.includes(k.toLowerCase()));
    if (baseMatch) return BASE_LAND_MAPPING[baseMatch];
    
    return '—';
}

export function getTicketClass(rideName: string, resort: ResortId): string {
    const name = rideName.toLowerCase();
    const baseTickets: Record<string, string> = {
        'resistance': 'E', 'avatar': 'E', 'tron': 'E', 'space mountain': 'E',
        'guardians': 'E', 'slinky': 'E', 'radiator': 'E', 'seven dwarfs': 'E',
        'mickey & minnie': 'E', 'tower of terror': 'E', 'test track': 'E',
        'pirates': 'D', 'haunted': 'D', 'big thunder': 'D', 'indiana jones': 'D',
        'jungle cruise': 'D', 'soarin': 'D', 'frozen': 'D', 'peter pan': 'D',
        'toy story mania': 'D', 'mission': 'D', 'everest': 'D', 'kilimanjaro': 'D',
        'small world': 'C', 'pooh': 'C', 'buzz': 'C', 'navigation': 'C',
        'barnstormer': 'B', 'dumbo': 'B', 'mad tea': 'B', 'nemo': 'B',
    };
    
    const match = Object.keys(baseTickets).find(k => name.includes(k));
    return match ? baseTickets[match] : '—';
}

export function getDefaultParkForResort(resort: ResortId): string {
    return RESORT_PARKS[resort][0];
}
