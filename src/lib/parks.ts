export type ResortId = 'DLR' | 'WDW';

// ─── Resort Definitions ──────────────────────────────────────────────────────

export const RESORTS: Record<ResortId, { name: string; shortName: string; parks: string[] }> = {
    DLR: {
        name: 'Disneyland Resort',
        shortName: 'Disneyland',
        parks: ['DLR_DISNEYLAND', 'DLR_DCA'],
    },
    WDW: {
        name: 'Walt Disney World Resort',
        shortName: 'Disney World',
        parks: ['WDW_MK', 'WDW_EPCOT', 'WDW_HS', 'WDW_AK'],
    },
};

// ─── Park IDs (from themeparks.wiki API) ────────────────────────────────────

export const PARKS = {
    // Disneyland Resort
    DISNEYLAND_PARK: '7340550b-c14d-4def-80bb-acdb51d49a66',
    DISNEY_CALIFORNIA_ADVENTURE: '832fcd51-ea19-4e77-85c7-75d5843b127c',

    // Walt Disney World Resort
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
    // ── Disneyland Park ──────────────────────────────────────────────────────
    'Star Wars: Rise of the Resistance': "Galaxy's Edge",
    'Millennium Falcon: Smugglers Run': "Galaxy's Edge",
    'Space Mountain': 'Tomorrowland',
    'Star Tours': 'Tomorrowland',
    'Buzz Lightyear Astro Blasters': 'Tomorrowland',
    'Autopia': 'Tomorrowland',
    'Finding Nemo Submarine Voyage': 'Tomorrowland',
    'Astro Orbitor': 'Tomorrowland',
    'Matterhorn Bobsleds': 'Fantasyland',
    "It's a Small World": 'Fantasyland',
    "Peter Pan's Flight": 'Fantasyland',
    "Mr. Toad's Wild Ride": 'Fantasyland',
    'Alice in Wonderland': 'Fantasyland',
    'Dumbo the Flying Elephant': 'Fantasyland',
    'King Arthur Carrousel': 'Fantasyland',
    'Mad Tea Party': 'Fantasyland',
    "Pinocchio's Daring Journey": 'Fantasyland',
    "Snow White's Enchanted Wish": 'Fantasyland',
    'Casey Jr. Circus Train': 'Fantasyland',
    'Storybook Land Canal Boats': 'Fantasyland',
    'Big Thunder Mountain Railroad': 'Frontierland',
    'Mark Twain Riverboat': 'Frontierland',
    "Shootin' Exposition": 'Frontierland',
    'Pirates of the Caribbean': 'New Orleans Square',
    'Haunted Mansion': 'New Orleans Square',
    'Indiana Jones': 'Adventureland',
    'Jungle Cruise': 'Adventureland',
    'Enchanted Tiki Room': 'Adventureland',
    'Treehouse': 'Adventureland',
    "Tiana's Bayou Adventure": 'Bayou Country',
    'Winnie the Pooh': 'Critter Country',
    'Runaway Railway': 'Toontown',
    'Roger Rabbit': 'Toontown',
    'GADGETcoaster': 'Toontown',
    "Mickey's House": 'Toontown',
    "Minnie's House": 'Toontown',

    // ── Disney California Adventure ──────────────────────────────────────────
    'Radiator Springs Racers': 'Cars Land',
    "Mater's Junkyard Jamboree": 'Cars Land',
    "Luigi's Rollickin' Roadsters": 'Cars Land',
    'Guardians of the Galaxy': 'Avengers Campus',
    'WEB SLINGERS': 'Avengers Campus',
    'Incredicoaster': 'Pixar Pier',
    'Toy Story Midway Mania!': 'Pixar Pier',
    'Pixar Pal-A-Round': 'Pixar Pier',
    'Inside Out Emotional Whirlwind': 'Pixar Pier',
    "Jessie's Critter Carousel": 'Pixar Pier',
    "Soarin' Around the World": 'Grizzly Peak',
    'Grizzly River Run': 'Grizzly Peak',
    'Redwood Creek': 'Grizzly Peak',
    "Goofy's Sky School": 'Paradise Gardens',
    'Little Mermaid': 'Paradise Gardens',
    'Silly Symphony Swings': 'Paradise Gardens',
    "Jumpin' Jellyfish": 'Paradise Gardens',
    'Golden Zephyr': 'Paradise Gardens',
    'Monsters, Inc.': 'Hollywood Land',
    'Animation Academy': 'Hollywood Land',
    'Turtle Talk': 'Hollywood Land',
    'PhilharMagic': 'Hollywood Land',

    // ── Magic Kingdom ────────────────────────────────────────────────────────
    'Seven Dwarfs Mine Train': 'Fantasyland',
    'Under the Sea': 'Fantasyland',
    'Prince Charming Regal Carrousel': 'Fantasyland',
    'Tomorrowland Speedway': 'Tomorrowland',
    'Tron Lightcycle / Run': 'Tomorrowland',
    'TRON Lightcycle': 'Tomorrowland',
    'Monsters Inc. Laugh Floor': 'Tomorrowland',
    'Buzz Lightyear Space Ranger': 'Tomorrowland',
    'Carousel of Progress': 'Tomorrowland',
    'Astro Orbiter': 'Tomorrowland',
    'Big Thunder Mountain': 'Frontierland',
    'Splash Mountain': 'Frontierland',
    'Tom Sawyer Island': 'Frontierland',
    'Magic Carpets of Aladdin': 'Adventureland',
    'Walt Disney World Railroad': 'Main Street, U.S.A.',
    'Hall of Presidents': 'Liberty Square',
    'Liberty Belle Riverboat': 'Liberty Square',

    // ── EPCOT ────────────────────────────────────────────────────────────────
    'Guardians of the Galaxy: Cosmic Rewind': 'World Discovery',
    'Test Track': 'World Discovery',
    'Mission: SPACE': 'World Discovery',
    'Spaceship Earth': 'World Celebration',
    'Remy': 'World Celebration',
    "Remy's Ratatouille Adventure": 'World Celebration',
    'Frozen': 'World Showcase',
    'Frozen Ever After': 'World Showcase',
    'Gran Fiesta Tour': 'World Showcase',
    'Reflections of China': 'World Showcase',
    'Living with the Land': 'World Nature',
    'Soarin': 'World Nature',
    "Turtle Talk with Crush": 'World Nature',

    // ── Hollywood Studios ────────────────────────────────────────────────────
    'Slinky Dog Dash': 'Toy Story Land',
    'Toy Story Mania!': 'Toy Story Land',
    'Alien Swirling Saucers': 'Toy Story Land',
    "Rock 'n' Roller Coaster": 'Sunset Boulevard',
    'Tower of Terror': 'Sunset Boulevard',
    'The Twilight Zone Tower of Terror': 'Sunset Boulevard',
    'Muppet*Vision 3D': 'Grand Avenue',
    "Mickey & Minnie's Runaway Railway": 'Hollywood Boulevard',
    'Indiana Jones Epic Stunt Spectacular': 'Echo Lake',

    // ── Animal Kingdom ───────────────────────────────────────────────────────
    'Avatar Flight of Passage': 'Pandora',
    "Na'vi River Journey": 'Pandora',
    "Expedition Everest": 'Asia',
    'Kali River Rapids': 'Asia',
    "Kilimanjaro Safaris": 'Africa',
    "Wildlife Express Train": 'Africa',
    "DINOSAUR": "DinoLand U.S.A.",
    "Triceratop Spin": "DinoLand U.S.A.",
    "The Boneyard": "DinoLand U.S.A.",
};

// ─── Ticket Tier Mapping ─────────────────────────────────────────────────────

export const TICKET_MAPPING: Record<string, string> = {
    // ── DLR E-Tickets ────────────────────────────────────────────────────────
    'Star Wars: Rise of the Resistance': 'E',
    'Radiator Springs Racers': 'E',
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

    // ── DLR D-Tickets ────────────────────────────────────────────────────────
    'Matterhorn Bobsleds': 'D',
    'Star Tours': 'D',
    'Toy Story Midway Mania!': 'D',
    'Jungle Cruise': 'D',
    'WEB SLINGERS': 'D',
    'Grizzly River Run': 'D',
    "Roger Rabbit's Car Toon Spin": 'D',
    "It's a Small World": 'D',
    "Peter Pan's Flight": 'D',

    // ── DLR C-Tickets ────────────────────────────────────────────────────────
    'Buzz Lightyear Astro Blasters': 'C',
    'Monsters, Inc.': 'C',
    "Goofy's Sky School": 'C',
    'The Little Mermaid': 'C',
    'Autopia': 'C',
    'Alice in Wonderland': 'C',
    "Mr. Toad's Wild Ride": 'C',
    "Snow White's Enchanted Wish": 'C',
    "Pinocchio's Daring Journey": 'C',
    "Luigi's Rollickin' Roadsters": 'C',
    "Mater's Junkyard Jamboree": 'C',

    // ── DLR B/A-Tickets ──────────────────────────────────────────────────────
    'Dumbo the Flying Elephant': 'B',
    'Mad Tea Party': 'B',
    'Astro Orbitor': 'B',
    'King Arthur Carrousel': 'B',
    'Casey Jr. Circus Train': 'B',
    'Storybook Land Canal Boats': 'B',
    'Pixar Pal-A-Round': 'B',
    'Silly Symphony Swings': 'B',
    'Inside Out Emotional Whirlwind': 'B',
    "Jumpin' Jellyfish": 'B',
    'Golden Zephyr': 'B',
    'GADGETcoaster': 'B',
    'Mark Twain Riverboat': 'A',
    'Sailing Ship Columbia': 'A',
    'Treehouse': 'A',
    'Main Street Vehicles': 'A',
    'Sleeping Beauty Castle Walkthrough': 'A',
    'Enchanted Tiki Room': 'A',
    'Animation Academy': 'A',
    'Turtle Talk': 'A',

    // ── WDW E-Tickets (not already in DLR section) ───────────────────────────
    'Seven Dwarfs Mine Train': 'E',
    'TRON Lightcycle': 'E',
    'Tron Lightcycle / Run': 'E',
    'Guardians of the Galaxy: Cosmic Rewind': 'E',
    'Avatar Flight of Passage': 'E',
    'Expedition Everest': 'E',
    "Rock 'n' Roller Coaster Starring Aerosmith": 'E',
    'The Twilight Zone Tower of Terror': 'E',
    'Slinky Dog Dash': 'E',
    "Remy's Ratatouille Adventure": 'E',

    // ── WDW D-Tickets (not already in DLR section) ───────────────────────────
    'Big Thunder Mountain': 'D',
    'Splash Mountain': 'D',
    'Test Track': 'D',
    'Mission: SPACE': 'D',
    'Soarin Around the World': 'D',
    'Living with the Land': 'D',
    'Frozen Ever After': 'D',
    'Kali River Rapids': 'D',
    'Kilimanjaro Safaris': 'D',
    'Toy Story Mania!': 'D',

    // ── WDW C/B/A-Tickets (not already in DLR section) ──────────────────────
    "Buzz Lightyear's Space Ranger Spin": 'C',
    "Na'vi River Journey": 'C',
    'Alien Swirling Saucers': 'C',
    'Tomorrowland Speedway': 'B',
    'Magic Carpets of Aladdin': 'B',
    'The Many Adventures of Winnie the Pooh': 'B',
    'Prince Charming Regal Carrousel': 'B',
    'Carousel of Progress': 'A',
    'Hall of Presidents': 'A',
};

// ─── Ride Metadata Registry ──────────────────────────────────────────────────

export const RIDE_METADATA_REGISTRY: Record<string, string> = {
    // ── Disneyland Park ──────────────────────────────────────────────────────
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
    '4f0053e7-b8db-4833-b02f-35e1c91b4523': "Snow White's Enchanted Wish",
    '59647168-d239-4161-8b24-92eb128e96fb': "Chip 'n' Dale's GADGETcoaster",
    '9167db1d-e5e7-46da-a07f-ae30a87bc4c4': 'Space Mountain',
    '0de1413a-73ee-46cf-af2e-c491cc7c7d3b': 'Big Thunder Mountain Railroad',
    'a07f3110-013e-43bb-a182-e66bb8b5e28d': 'Alice in Wonderland',
    'c9e39189-7e99-4e0a-97e0-4a0d5654d257': 'Sailing Ship Columbia',
    'cb929138-d77a-4dd2-983c-f651bbd1bd92': 'Storybook Land Canal Boats',
    '64d44aaa-6857-4693-b24b-bcff6c6dcfa1': 'Finding Nemo Submarine Voyage',

    // ── Disney California Adventure ──────────────────────────────────────────
    '528016ef-db24-47fa-a0f2-b6d26d61e29f': 'Pixar Pal-A-Round - Swinging',
    'b1d285a7-2444-4a7c-b7bb-d2d4d6428a85': 'Grizzly River Run',
    '8f586a2f-cef5-46d3-b822-fd622c4e9e33': "Mickey's PhilharMagic",
    'd2aa0987-49a2-45dc-a635-3a8bf7401230': 'Animation Academy',
    '77f205a4-d482-4d91-a5ff-71e54a086ad2': "Soarin' Over California",
    '86ab3069-110d-49c5-a7e7-29ddf28695a6': 'Toy Story Midway Mania!',
    '7561bcd8-18ea-4e3f-89d5-c905b7ba3d42': 'Turtle Talk with Crush',
    '46097afe-a1ea-4807-93d3-14d14f36e55f': "Mater's Junkyard Jamboree",
    'c8a4b7b1-c1b2-4dfe-b73c-4e834b4a73db': "Jumpin' Jellyfish",
    'c9803366-6f37-4406-82af-7692357e3ca9': 'Redwood Creek Challenge Trail',
    '388ad3f1-5cf5-4a9d-8d0e-6dfb817d7822': "Jessie's Critter Carousel",
    '7a09a2f0-e226-4f3e-86f8-2598ab67ec44': "Luigi's Rollickin' Roadsters",
    '2295351d-ce6b-4c04-92d5-5b416372c5b5': 'WEB SLINGERS: A Spider-Man Adventure',
    'e1fbc7a1-2cd1-4282-b373-ac11d9d9d38a': 'The Little Mermaid - Ariel\'s Undersea Adventure',
    '4f5b28d0-b78e-482b-8e2e-1f90756d6220': 'Silly Symphony Swings',
    '5d07a2b1-49ca-4de7-9d32-6d08edf69b08': 'Incredicoaster',
    '40524fba-5d84-49e7-9204-f493dbe2d5a4': 'Monsters, Inc. Mike & Sulley to the Rescue!',
    'f44a5072-3cda-4c7c-8574-33ad09d16cca': "Goofy's Sky School",
    'b7678dab-5544-48d5-8fdc-c1a0127cfbcd': 'Guardians of the Galaxy - Mission: BREAKOUT!',
    '6d876f4c-c3ff-4ae3-a2d8-d4b831e1039b': 'Inside Out Emotional Whirlwind',
    'c60c768b-3461-465c-8f4f-b44b087506fc': 'Radiator Springs Racers',
    '4ca6cdbf-4c5f-45bf-b0dc-db83393ec208': 'Pixar Pal-A-Round – Non-Swinging',
    '10a5fc6f-5ad3-414b-9bdd-e6bae097b6ad': 'Golden Zephyr',
};

// ─── Resort-Specific Overrides ───────────────────────────────────────────────

export const RESORT_SPECIFIC_LANDS: Record<ResortId, Record<string, string>> = {
    DLR: {
        'Soarin\' Around the World': 'Grizzly Peak',
        'Turtle Talk': 'Hollywood Land',
        'Star Tours': 'Tomorrowland',
        'Space Mountain': 'Tomorrowland',
        'Toy Story Midway Mania!': 'Pixar Pier',
    },
    WDW: {
        'Soarin\' Around the World': 'World Nature',
        'Turtle Talk with Crush': 'World Nature',
        'Star Tours': 'Echo Lake',
        'Space Mountain': 'Tomorrowland',
        'Toy Story Mania!': 'Toy Story Land',
        'Tower of Terror': 'Sunset Boulevard',
    }
};

export const RESORT_SPECIFIC_TICKETS: Record<ResortId, Record<string, string>> = {
    DLR: {
        'Space Mountain': 'E',
        'Big Thunder Mountain Railroad': 'E',
    },
    WDW: {
        'Space Mountain': 'E',
        'Big Thunder Mountain': 'D',
    }
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function getLand(rideName: string, resort: ResortId = 'DLR'): string {
    // 1. Check resort-specific exact overrides
    if (RESORT_SPECIFIC_LANDS[resort][rideName]) {
        return RESORT_SPECIFIC_LANDS[resort][rideName];
    }
    
    // 2. Check general exact match
    if (LAND_MAPPING[rideName]) return LAND_MAPPING[rideName];
    
    // 3. Check resort-specific partial match
    const specificKey = Object.keys(RESORT_SPECIFIC_LANDS[resort]).find(k => rideName.includes(k));
    if (specificKey) return RESORT_SPECIFIC_LANDS[resort][specificKey];

    // 4. Check general partial match
    const key = Object.keys(LAND_MAPPING).find(k => rideName.includes(k));
    if (key) return LAND_MAPPING[key];
    
    return '—';
}

export function getTicketClass(rideName: string, resort: ResortId = 'DLR'): string {
    // 1. Check resort-specific exact overrides
    if (RESORT_SPECIFIC_TICKETS[resort][rideName]) {
        return RESORT_SPECIFIC_TICKETS[resort][rideName];
    }

    // 2. Check general exact match
    if (TICKET_MAPPING[rideName]) return TICKET_MAPPING[rideName];
    
    // 3. Check resort-specific partial match
    const specificKey = Object.keys(RESORT_SPECIFIC_TICKETS[resort]).find(k => rideName.includes(k));
    if (specificKey) return RESORT_SPECIFIC_TICKETS[resort][specificKey];

    // 4. Check general partial match
    const key = Object.keys(TICKET_MAPPING).find(k => rideName.includes(k));
    if (key) return TICKET_MAPPING[key];
    
    return '—';
}

export function getDefaultParkForResort(resort: ResortId): string {
    return RESORT_PARKS[resort][0];
}
