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
        parks: ['75ea578a-adc8-4116-a54d-dccb60765ef9', '47f90d2c-e191-4239-a466-5892ef59a88b', '288747d1-8b4f-4a64-867e-ea7c9b27bad8', '1c84a229-8862-4648-9c71-378ddd2c7693'],
    },
};

// ─── Park IDs (from themeparks.wiki API) ────────────────────────────────────

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

export const PARK_SHORT_NAMES: Record<string, string> = {
    [PARKS.DISNEYLAND_PARK]: 'Disneyland',
    [PARKS.DISNEY_CALIFORNIA_ADVENTURE]: 'DCA',
    [PARKS.MAGIC_KINGDOM]: 'Magic Kingdom',
    [PARKS.EPCOT]: 'EPCOT',
    [PARKS.HOLLYWOOD_STUDIOS]: 'Hollywood Studios',
    [PARKS.ANIMAL_KINGDOM]: 'Animal Kingdom',
};

// ─── Land Mapping ────────────────────────────────────────────────────────────

export const LAND_MAPPING: Record<string, string> = {
    'Star Wars: Rise of the Resistance': "Galaxy's Edge",
    'Millennium Falcon: Smugglers Run': "Galaxy's Edge",
    'Space Mountain': 'Tomorrowland',
    'Star Tours': 'Tomorrowland',
    'Pirates of the Caribbean': 'Adventureland',
    'Haunted Mansion': 'Fantasyland',
    'Big Thunder Mountain Railroad': 'Frontierland',
    'Jungle Cruise': 'Adventureland',
    "it's a small world": 'Fantasyland',
    'Dumbo the Flying Elephant': 'Fantasyland',
    'Mad Tea Party': 'Fantasyland',
    "Peter Pan's Flight": 'Fantasyland',
    'Seven Dwarfs Mine Train': 'Fantasyland',
    "Mickey & Minnie's Runaway Railway": 'Toontown',
    'Astro Orbitor': 'Tomorrowland',
    'Autopia': 'Tomorrowland',
    'King Arthur Carrousel': 'Fantasyland',
    'Matterhorn Bobsleds': 'Fantasyland',
    'Alice in Wonderland': 'Fantasyland',
    "Mr. Toad's Wild Ride": 'Fantasyland',
    "Pinocchio's Daring Journey": 'Fantasyland',
    "Snow White's Enchanted Wish": 'Fantasyland',
    'Casey Jr. Circus Train': 'Fantasyland',
    'Storybook Land Canal Boats': 'Fantasyland',
    'Mark Twain Riverboat': 'Frontierland',
    'Tomorrowland Speedway': 'Tomorrowland',
    'Enchanted Tiki Room': 'Adventureland',
    'Slinky Dog Dash': 'Toy Story Land',
    'Toy Story Mania!': 'Toy Story Land',
    'Tower of Terror': 'Sunset Boulevard',
    'Guardians of the Galaxy': 'Avengers Campus',
    "Soarin' Around the World": 'World Nature',
    'Turtle Talk with Crush': 'World Nature',
    'Expedition Everest': 'Asia',
    'Kali River Rapids': 'Asia',
    'Spaceship Earth': 'World Celebration',
    'Remy\'s Ratatouille Adventure': 'World Celebration',
    'Frozen Ever After': 'World Showcase',
    'Avatar Flight of Passage': 'Pandora',
    "Na'vi River Journey": 'Pandora',
    'Kilimanjaro Safaris': 'Africa',
    'DINOSAUR': 'DinoLand U.S.A.',
    'Test Track': 'World Discovery',
    'Mission: SPACE': 'World Discovery',
};

// ─── Ticket Tier Mapping ─────────────────────────────────────────────────────

export const TICKET_MAPPING: Record<string, string> = {
    'Star Wars: Rise of the Resistance': 'E',
    'Space Mountain': 'E',
    'Indiana Jones': 'E',
    'Pirates of the Caribbean': 'E',
    'Haunted Mansion': 'E',
    'Big Thunder Mountain Railroad': 'E',
    'Guardians of the Galaxy': 'E',
    'Incredicoaster': 'E',
    "Soarin' Around the World": 'E',
    "Tiana's Bayou Adventure": 'E',
    "Mickey & Minnie's Runaway Railway": 'E',
    'Millennium Falcon: Smugglers Run': 'E',
    'TRON Lightcycle': 'E',
    'Slinky Dog Dash': 'E',
    'Star Tours': 'D',
    'Jungle Cruise': 'D',
    'Seven Dwarfs Mine Train': 'E',
    'Matterhorn Bobsleds': 'D',
    'Grizzly River Run': 'D',
    'Test Track': 'D',
    'Mission: SPACE': 'D',
    'Frozen Ever After': 'D',
    'Kilimanjaro Safaris': 'D',
    'Dumbo the Flying Elephant': 'B',
    'Mad Tea Party': 'B',
    'Carousel of Progress': 'A',
    'Hall of Presidents': 'A',
};

// ─── Ride Metadata Registry ──────────────────────────────────────────────────

export const RIDE_METADATA_REGISTRY: Record<string, string> = {
    '87387057-47ab-4d0b-8eed-2e6c9d23577b': "Mickey's House and Meet Mickey Mouse",
    'ca32ef8a-ae0d-4c24-bf4f-e59192122e01': "Donald's Duck Pond",
    '37858b2a-9c11-4ac6-9f8d-db7fa9088703': 'The Disney Gallery',
    '2aedc657-1ee2-4545-a1ce-14753f28cc66': 'Indiana Jones™ Adventure',
    'bcfd1e17-3eab-4203-b597-6257a257d427': 'Main Street Vehicles',
    'f5bb0d14-7eee-4ede-9230-eb256ce3664c': 'Main Street Cinema',
    '835deb74-de54-4d7f-9dc4-dacab90fcb60': "Frontierland Shootin' Exposition",
    '90ee50d4-7cc9-4824-b29d-2aac801acc29': "Pinocchio's Daring Journey",
    'c02fb82d-0860-4e95-8c61-899fa594d20e': "Minnie's House",
    '8e686e4c-f3db-4d9c-a185-2d54b1fa8899': 'Casey Jr. Circus Train',
    'f7904912-3f08-4563-b99e-fd59f43cc9f2': 'King Arthur Carrousel',
    '82aeb29b-504a-416f-b13f-f41fa5b766aa': 'Pirates of the Caribbean',
    '1b83fda8-d60e-48e4-9a3d-90ddcbcd1001': 'Jungle Cruise',
    '90d5a091-478c-4df1-adfe-c605b4005013': 'Sleeping Beauty Castle Walkthrough',
    'b0eca3d3-a519-47f9-a5a7-9911126da2df': "Goofy's How-to-Play Yard",
    'c23af6ba-8515-406a-8a48-d0818ba0bfc9': "Peter Pan's Flight",
    'faaa8be9-cc1e-4535-ac20-04a535654bd0': 'Matterhorn Bobsleds',
    '52a8ef64-d54c-4974-883f-027c3026e3f1': 'The Many Adventures of Winnie the Pooh',
    'cd670bff-81d1-4f34-8676-7bafdf49220a': "Mickey & Minnie's Runaway Railway",
    '88197808-3c56-4198-a5a4-6066541251cf': 'Buzz Lightyear Astro Blasters',
    'e0cfed11-96d7-40f3-907f-5cfed172592a': 'Mad Tea Party',
    'cc980e8e-192f-48b6-848c-27784084e54b': 'Dumbo the Flying Elephant',
    'cc718d11-fa15-44ee-87d0-ded989ad61bc': 'Star Tours - The Adventures Continue',
    '1da85181-bf0f-4ccc-b98e-243142f7347b': 'Autopia',
    '34b1d70f-11c4-42df-935e-d5582c9f1a8e': 'Star Wars: Rise of the Resistance',
    '56d0bd6d-5106-4420-8f60-0005475c04c3': 'Disneyland Monorail',
    'b2c2549c-e9da-4fdd-98ea-1dcff596fed7': 'Millennium Falcon: Smugglers Run',
    '106c1e5a-a5e7-42d7-96ab-bc100d8faf71': "Walt Disney's Enchanted Tiki Room",
    'e2d460e9-2bef-4613-b126-092ab7cb37e5': 'Disneyland Railroad',
    'ff52cb64-c1d5-4feb-9d43-5dbd429bac81': 'Haunted Mansion',
    '9d401ad3-49b2-469f-ac73-93eb429428fb': "Mr. Toad's Wild Ride",
    '5bd95ae8-181d-449c-8f04-a621e2448961': "Davy Crockett's Explorer Canoes",
    '6ce9cdd1-0a43-459e-83cd-f4cace9cfa7b': "Roger Rabbit's Car Toon Spin",
    '6c225598-91c9-44a3-95e2-7c423475db61': 'Astro Orbitor',
    'e27b1db8-9ec9-4f8b-9ca6-fd6377de66ee': 'Adventureland Treehouse',
    '3638ac09-9fce-4a43-8c79-8ebbe17afce2': '"it\'s a small world"',
    '6c30d5b0-8c0a-406f-9258-0b6c55d4a5e4': 'Mark Twain Riverboat',
    'a9076acd-7630-4bad-a8da-e6bd689ddcac': "Tiana's Bayou Adventure",
    '4f5b28d0-b78e-482b-8e2e-1f90756d6220': 'Silly Symphony Swings',
    'b7678dab-5544-48d5-8fdc-c1a0127cfbcd': 'Guardians of the Galaxy - Mission: BREAKOUT!',
    'c60c768b-3461-465c-8f4f-b44b087506fc': 'Radiator Springs Racers',
};

// ─── Resort-Specific Overrides ───────────────────────────────────────────────

export const RESORT_SPECIFIC_LANDS: Record<ResortId, Record<string, string>> = {
    DLR: {
        'Star Tours': 'Tomorrowland',
        'Space Mountain': 'Tomorrowland',
        'Haunted Mansion': 'New Orleans Square',
        'Pirates of the Caribbean': 'New Orleans Square',
    },
    WDW: {
        'Star Tours': 'Echo Lake',
        'Space Mountain': 'Tomorrowland',
        'Haunted Mansion': 'Liberty Square',
        'Pirates of the Caribbean': 'Adventureland',
    }
};

export const RESORT_SPECIFIC_TICKETS: Record<ResortId, Record<string, string>> = {
    DLR: {
        'Space Mountain': 'E',
    },
    WDW: {
        'Space Mountain': 'E',
        'Big Thunder Mountain Railroad': 'D',
    }
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function getLand(rideName: string, resort: ResortId = 'DLR'): string {
    if (RESORT_SPECIFIC_LANDS[resort][rideName]) return RESORT_SPECIFIC_LANDS[resort][rideName];
    if (LAND_MAPPING[rideName]) return LAND_MAPPING[rideName];
    
    const specificKey = Object.keys(RESORT_SPECIFIC_LANDS[resort]).find(k => rideName.includes(k));
    if (specificKey) return RESORT_SPECIFIC_LANDS[resort][specificKey];

    const key = Object.keys(LAND_MAPPING).find(k => rideName.includes(k));
    if (key) return LAND_MAPPING[key];
    
    return '—';
}

export function getTicketClass(rideName: string, resort: ResortId = 'DLR'): string {
    if (RESORT_SPECIFIC_TICKETS[resort][rideName]) return RESORT_SPECIFIC_TICKETS[resort][rideName];
    if (TICKET_MAPPING[rideName]) return TICKET_MAPPING[rideName];
    
    const specificKey = Object.keys(RESORT_SPECIFIC_TICKETS[resort]).find(k => rideName.includes(k));
    if (specificKey) return RESORT_SPECIFIC_TICKETS[resort][specificKey];

    const key = Object.keys(TICKET_MAPPING).find(k => rideName.includes(k));
    if (key) return TICKET_MAPPING[key];
    
    return '—';
}

export function getDefaultParkForResort(resort: ResortId): string {
    return RESORT_PARKS[resort][0];
}
