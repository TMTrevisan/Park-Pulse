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
    'Slinky Dog': 'Toy Story Land',
    'Toy Story Mania': 'Toy Story Land',
    'Soarin': 'World Nature',
    'Expedition Everest': 'Asia',
    'Flight of Passage': 'Pandora',
    'Spaceship Earth': 'World Celebration',
    'Test Track': 'World Discovery',
    'Test Track 2.0': 'World Discovery',
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
    'Remy\'s Ratatouille': 'World Showcase',
    'Gran Fiesta Tour': 'World Showcase',
    'Na\'vi River Journey': 'Pandora',
    'Wildlife Express': 'Africa',
    'TriceraTop Spin': 'DinoLand U.S.A.',
    'Alien Swirling Saucers': 'Toy Story Land',
    'Indiana Jones': 'Adventureland',
    'Haunted Mansion': 'Liberty Square',
    'Space Mountain': 'Tomorrowland',
    'Pirates of the Caribbean': 'Adventureland',
    'Matterhorn': 'Fantasyland',
    'Submarine Voyage': 'Tomorrowland',
    'Autopia': 'Tomorrowland',
    'Alice in Wonderland': 'Fantasyland',
    'Mr. Toad': 'Fantasyland',
    'Pinocchio': 'Fantasyland',
    'Snow White': 'Fantasyland',
    'Roger Rabbit': 'Mickey\'s Toontown',
    'Gadget\'s Go Coaster': 'Mickey\'s Toontown',
    'Goofy\'s Sky School': 'Pixar Pier',
    'Incredicoaster': 'Pixar Pier',
    'Web Slingers': 'Avengers Campus',
    'Guardians of the Galaxy Mission': 'Avengers Campus',
    'Radiator Springs': 'Cars Land',
    'Luigi\'s': 'Cars Land',
    'Mater\'s': 'Cars Land',
    'Soarin\' Around': 'Grizzly Peak',
    'Grizzly River Run': 'Grizzly Peak',
    'Monsters, Inc. Mike & Sulley': 'Hollywood Land',
    'Little Mermaid': 'Fantasyland'
};

export const RESORT_LAND_OVERRIDES: Record<ResortId, Record<string, string>> = {
    DLR: {
        'Haunted Mansion': 'New Orleans Square',
        'Pirates of the Caribbean': 'New Orleans Square',
        'Space Mountain': 'Tomorrowland',
        'Indiana Jones': 'Adventureland',
        'Winnie the Pooh': 'Critter Country',
        'Tiana\'s Bayou': 'Critter Country', // For Disneyland it's in Critter Country (for now)
        'Star Tours': 'Tomorrowland',
        'Matterhorn': 'Fantasyland',
        'Runaway Railway': 'Mickey\'s Toontown',
        'Splash Mountain': 'Critter Country',
        'Casey Jr.': 'Fantasyland',
        'Storybook Land': 'Fantasyland',
        'King Arthur': 'Fantasyland',
        'Astro Orbitor': 'Tomorrowland',
        'Monorail': 'Tomorrowland',
        'Great Moments with Mr. Lincoln': 'Main Street, U.S.A.',
    },
    WDW: {
        'Haunted Mansion': 'Liberty Square',
        'Pirates of the Caribbean': 'Adventureland',
        'Space Mountain': 'Tomorrowland',
        'Winnie the Pooh': 'Fantasyland',
        'Tiana\'s Bayou': 'Frontierland',
        'Star Tours': 'Echo Lake',
        'Runaway Railway': 'Hollywood Boulevard',
        'Buzz Lightyear': 'Tomorrowland',
        'Under the Sea': 'Fantasyland',
        'TRON': 'Tomorrowland',
        'Seven Dwarfs': 'Fantasyland',
        'Dumbo': 'Fantasyland',
        'Barnstormer': 'Fantasyland',
        'Big Thunder': 'Frontierland',
        'Jungle Cruise': 'Adventureland',
        'Tomorrowland Speedway': 'Tomorrowland',
        'PeopleMover': 'Tomorrowland',
        'Mad Tea Party': 'Fantasyland',
        'Peter Pan': 'Fantasyland',
        'small world': 'Fantasyland',
        'PhilharMagic': 'Fantasyland',
        'Enchanted Tales': 'Fantasyland',
        'Monsters, Inc. Laugh Floor': 'Tomorrowland',
        'Astro Orbiter': 'Tomorrowland',
        'Magic Carpets of Aladin': 'Adventureland',
        'Swiss Family Treehouse': 'Adventureland',
        'Walt Disney World Railroad': 'Main Street, U.S.A.',
        'Hall of Presidents': 'Liberty Square',
        'Liberty Belle': 'Liberty Square',
        'Tom Sawyer Island': 'Frontierland',
        'Carousel of Progress': 'Tomorrowland',
        'Country Bear Jamboree': 'Frontierland',
        'Cosmic Rewind': 'World Discovery',
        'Mission: SPACE': 'World Discovery',
        'Soarin': 'World Nature',
        'Living with the Land': 'World Nature',
        'The Seas with Nemo': 'World Nature',
        'Spaceship Earth': 'World Celebration',
        'Journey into Imagination': 'World Celebration',
        'Turtle Talk': 'World Nature',
        'Remy\'s Ratatouille': 'World Showcase',
        'Frozen Ever After': 'World Showcase',
        'Gran Fiesta Tour': 'World Showcase',
        'Rock \'n\' Roller Coaster': 'Sunset Boulevard',
        'Tower of Terror': 'Sunset Boulevard',
        'Slinky Dog': 'Toy Story Land',
        'Toy Story Mania': 'Toy Story Land',
        'Alien Swirling Saucers': 'Toy Story Land',
        'Rise of the Resistance': 'Galaxy\'s Edge',
        'Smugglers Run': 'Galaxy\'s Edge',
        'Muppet*Vision 3D': 'Grand Avenue',
        'Flight of Passage': 'Pandora',
        'Na\'vi River Journey': 'Pandora',
        'Expedition Everest': 'Asia',
        'Kilimanjaro Safaris': 'Africa',
        'DINOSAUR': 'DinoLand U.S.A.',
        'Kali River Rapids': 'Asia',
        'It\'s Tough to be a Bug': 'Discovery Island',
        'Maharajah Jungle Trek': 'Asia',
        'Gorilla Falls Exploration': 'Africa',
        'Feathered Friends in Flight': 'Asia',
        'Animation Courtyard': 'Animation Courtyard',
        'Mickey & Minnie\'s Runaway Railway': 'Hollywood Boulevard',
        'Slinky Dog Dash': 'Toy Story Land',
        'Star Wars: Rise of the Resistance': 'Galaxy\'s Edge',
        'Millennium Falcon: Smugglers Run': 'Galaxy\'s Edge',
        'Guardians of the Galaxy: Cosmic Rewind': 'World Discovery',
        'Remy\'s Ratatouille Adventure': 'World Showcase',
        'Gran Fiesta Tour Starring The Three Caballeros': 'World Showcase',
        'The Seas with Nemo & Friends': 'World Nature',
        'Journey into Imagination with Figment': 'World Celebration',
        'Turtle Talk with Crush': 'World Nature',
        'Soarin\' Around the World': 'World Nature',
        'Test Track 2.0': 'World Discovery',
        'Main Street Vehicles': 'Main Street, U.S.A.',
    }
};

// ─── Fuzzy Search Logic ──────────────────────────────────────────────────────

type RideMetadataOverride = {
    land: string;
    ticket: string;
};

const RESORT_RIDE_ID_OVERRIDES: Record<ResortId, Record<string, RideMetadataOverride>> = {
    DLR: {},
    WDW: {}
};

function normalizeRideName(name: string): string {
    if (!name) return "";
    return name
        .toLowerCase()
        .replace(/[’‘]/g, "'")
        .replace(/–/g, "-")
        .replace(/[^a-z0-9'\s-]/g, " ")
        .replace(/\s+/g, ' ')
        .trim();
}

const LAND_KEYWORD_FALLBACKS: Record<ResortId, Array<{ keyword: string; land: string }>> = {
    DLR: [
        { keyword: 'main street', land: 'Main Street, U.S.A.' },
        { keyword: 'adventureland', land: 'Adventureland' },
        { keyword: 'new orleans', land: 'New Orleans Square' },
        { keyword: 'frontierland', land: 'Frontierland' },
        { keyword: 'fantasyland', land: 'Fantasyland' },
        { keyword: 'tomorrowland', land: 'Tomorrowland' },
        { keyword: 'toontown', land: "Mickey's Toontown" },
        { keyword: 'cars land', land: 'Cars Land' },
        { keyword: 'pixar pier', land: 'Pixar Pier' },
        { keyword: 'avengers', land: 'Avengers Campus' },
        { keyword: 'grizzly', land: 'Grizzly Peak' },
        { keyword: 'buena vista', land: 'Buena Vista Street' },
        { keyword: 'hollywood land', land: 'Hollywood Land' },
        { keyword: 'critter', land: 'Critter Country' },
        { keyword: 'bayou country', land: 'Bayou Country' }
    ],
    WDW: [
        { keyword: 'main street', land: 'Main Street, U.S.A.' },
        { keyword: 'adventureland', land: 'Adventureland' },
        { keyword: 'frontierland', land: 'Frontierland' },
        { keyword: 'liberty square', land: 'Liberty Square' },
        { keyword: 'fantasyland', land: 'Fantasyland' },
        { keyword: 'tomorrowland', land: 'Tomorrowland' },
        { keyword: 'world showcase', land: 'World Showcase' },
        { keyword: 'world discovery', land: 'World Discovery' },
        { keyword: 'world nature', land: 'World Nature' },
        { keyword: 'world celebration', land: 'World Celebration' },
        { keyword: "galaxy's edge", land: "Galaxy's Edge" },
        { keyword: 'toy story land', land: 'Toy Story Land' },
        { keyword: 'sunset boulevard', land: 'Sunset Boulevard' },
        { keyword: 'echo lake', land: 'Echo Lake' },
        { keyword: 'grand avenue', land: 'Grand Avenue' },
        { keyword: 'animation courtyard', land: 'Animation Courtyard' },
        { keyword: 'pandora', land: 'Pandora' },
        { keyword: 'africa', land: 'Africa' },
        { keyword: 'asia', land: 'Asia' },
        { keyword: 'dinoland', land: 'DinoLand U.S.A.' },
        { keyword: 'discovery island', land: 'Discovery Island' }
    ]
};

const BASE_TICKET_MAPPING: Record<string, string> = {
    'rise of the resistance': 'E',
    'flight of passage': 'E',
    'cosmic rewind': 'E',
    'tron': 'E',
    'slinky dog': 'E',
    'radiator springs': 'E',
    'space mountain': 'E',
    'matterhorn': 'E',
    'indiana jones': 'E',
    'smugglers run': 'E',
    'remy': 'E',
    'frozen': 'E',
    'seven dwarfs': 'E',
    'mickey minnie runaway railway': 'E',
    'tower of terror': 'E',
    "rock n roller": 'E',
    'test track': 'E',
    'tianas bayou': 'E',
    'incredicoaster': 'E',
    'guardians of the galaxy': 'E',
    'haunted mansion': 'D',
    'pirates of the caribbean': 'D',
    'big thunder': 'D',
    'jungle cruise': 'D',
    'soarin': 'D',
    'kilimanjaro': 'D',
    'everest': 'D',
    'toy story mania': 'D',
    'mission space': 'D',
    'peter pan': 'D',
    'small world': 'C',
    'buzz lightyear': 'C',
    'winnie the pooh': 'C',
    'nemo': 'C',
    'dumbo': 'B',
    'mad tea party': 'B',
    'barnstormer': 'B'
};

const RESORT_TICKET_OVERRIDES: Record<ResortId, Record<string, string>> = {
    DLR: {
        'alice in wonderland': 'D',
        'roger rabbit': 'D',
        'web slingers': 'D',
        'goofys sky school': 'C',
        'monsters inc mike sulley': 'C',
        'little mermaid': 'C',
        'jessie critter carousel': 'B',
        'pixar pal around': 'B',
        'inside out emotional whirlwind': 'B',
        'luigis': 'C',
        'maters': 'B',
        'mark twain riverboat': 'A',
        'disneyland railroad': 'A',
        'disneyland monorail': 'A'
    },
    WDW: {
        'peoplemover': 'B',
        'carousel of progress': 'B',
        'tomorrowland speedway': 'C',
        'safaris': 'D',
        'navi river journey': 'D',
        'kali river rapids': 'C',
        'dinosaur': 'D',
        'living with the land': 'C',
        'spaceship earth': 'C',
        'journey into imagination': 'C',
        'gran fiesta tour': 'B',
        'seas with nemo': 'B',
        'walt disney world railroad': 'A'
    }
};

function lookupByFuzzyMap(term: string, map: Record<string, string>): string | null {
    const match = Object.keys(map).find(key => term.includes(normalizeRideName(key)));
    return match ? map[match] : null;
}

function getRideIdOverride(rideId: string | undefined, resort: ResortId): RideMetadataOverride | null {
    if (!rideId) return null;
    return RESORT_RIDE_ID_OVERRIDES[resort][rideId] || null;
}

export function getLand(rideName: string, resort: ResortId, rideId?: string): string {
    if (!rideName) return '—';

    const resortKey = (resort || 'DLR').toUpperCase() as ResortId;
    const byId = getRideIdOverride(rideId, resortKey);
    if (byId?.land) return byId.land;

    const term = normalizeRideName(rideName);

    // 1. Check Resort Overrides (Specific names)
    const overrides = (RESORT_LAND_OVERRIDES[resortKey] || {}) as Record<string, string>;
    const overrideMatch = lookupByFuzzyMap(term, overrides);
    if (overrideMatch) return overrideMatch;

    // 2. Check Base Land Mapping (Registry of attraction -> land)
    const baseMatch = lookupByFuzzyMap(term, BASE_LAND_MAPPING);
    if (baseMatch) return baseMatch;

    // 3. Keyword fallback by resort/park naming conventions
    const keywordMatch = LAND_KEYWORD_FALLBACKS[resortKey].find(({ keyword }) => term.includes(keyword));
    if (keywordMatch) return keywordMatch.land;

    return resortKey === 'DLR' ? 'Disneyland Resort Area' : 'Walt Disney World Area';
}


export function getTicketClass(rideName: string, resort: ResortId, rideId?: string): string {
    if (!rideName) return 'C';

    const resortKey = (resort || 'DLR').toUpperCase() as ResortId;
    const byId = getRideIdOverride(rideId, resortKey);
    if (byId?.ticket) return byId.ticket;

    const term = normalizeRideName(rideName);

    const resortOverride = lookupByFuzzyMap(term, RESORT_TICKET_OVERRIDES[resortKey]);
    if (resortOverride) return resortOverride;

    const baseMatch = lookupByFuzzyMap(term, BASE_TICKET_MAPPING);
    if (baseMatch) return baseMatch;

    // Fallback heuristic keeps every attraction classified.
    if (term.includes('railroad') || term.includes('riverboat') || term.includes('monorail') || term.includes('main street vehicle')) return 'A';
    if (term.includes('carousel') || term.includes('tea party') || term.includes('spinner') || term.includes('saucers')) return 'B';
    if (term.includes('cruise') || term.includes('adventure') || term.includes('tour') || term.includes('safari')) return 'C';
    if (term.includes('mountain') || term.includes('coaster') || term.includes('guardians') || term.includes('resistance')) return 'E';

    return 'C';
}

export function getDefaultParkForResort(resort: ResortId): string {
    const resortKey = (resort || 'DLR').toUpperCase() as ResortId;
    return RESORT_PARKS[resortKey]?.[0] || RESORT_PARKS['DLR'][0];
}
