export const PARKS = {
    DISNEYLAND_PARK: "7340550b-c14d-4def-80bb-acdb51d49a66",
    DISNEY_CALIFORNIA_ADVENTURE: "832fcd51-ea19-4e77-85c7-75d5843b127c",
};

export const PARK_NAMES = {
    [PARKS.DISNEYLAND_PARK]: "Disneyland Park",
    [PARKS.DISNEY_CALIFORNIA_ADVENTURE]: "Disney California Adventure",
};

// Comprehensive Land Mapping
export const LAND_MAPPING: Record<string, string> = {
    // Disneyland
    "Star Wars: Rise of the Resistance": "Galaxy's Edge",
    "Millennium Falcon: Smugglers Run": "Galaxy's Edge",
    "Space Mountain": "Tomorrowland",
    "Star Tours": "Tomorrowland",
    "Buzz Lightyear Astro Blasters": "Tomorrowland",
    "Autopia": "Tomorrowland",
    "Finding Nemo Submarine Voyage": "Tomorrowland",
    "Astro Orbitor": "Tomorrowland",
    "Matterhorn Bobsleds": "Fantasyland",
    "It's a Small World": "Fantasyland",
    "Peter Pan's Flight": "Fantasyland",
    "Mr. Toad's Wild Ride": "Fantasyland",
    "Alice in Wonderland": "Fantasyland",
    "Dumbo the Flying Elephant": "Fantasyland",
    "King Arthur Carrousel": "Fantasyland",
    "Mad Tea Party": "Fantasyland",
    "Pinocchio's Daring Journey": "Fantasyland",
    "Snow White's Enchanted Wish": "Fantasyland",
    "Casey Jr. Circus Train": "Fantasyland",
    "Storybook Land Canal Boats": "Fantasyland",
    "Big Thunder Mountain Railroad": "Frontierland",
    "Mark Twain Riverboat": "Frontierland",
    "Shootin' Exposition": "Frontierland",
    "Pirates of the Caribbean": "New Orleans Square",
    "Haunted Mansion": "New Orleans Square",
    "Indiana Jones": "Adventureland",
    "Jungle Cruise": "Adventureland",
    "Enchanted Tiki Room": "Adventureland",
    "Treehouse": "Adventureland",
    "Tiana's Bayou Adventure": "Bayou Country",
    "Winnie the Pooh": "Bayou Country",
    "Runaway Railway": "Toontown",
    "Roger Rabbit": "Toontown",
    "GADGETcoaster": "Toontown",
    "Mickey's House": "Toontown",
    "Minnie's House": "Toontown",

    // DCA
    "Radiator Springs Racers": "Cars Land",
    "Mater's Junkyard Jamboree": "Cars Land",
    "Luigi's Rollickin' Roadsters": "Cars Land",
    "Guardians of the Galaxy": "Avengers Campus",
    "WEB SLINGERS": "Avengers Campus",
    "Incredicoaster": "Pixar Pier",
    "Toy Story Midway Mania!": "Pixar Pier",
    "Pixar Pal-A-Round": "Pixar Pier",
    "Inside Out Emotional Whirlwind": "Pixar Pier",
    "Jessie's Critter Carousel": "Pixar Pier",
    "Soarin' Around the World": "Grizzly Peak",
    "Grizzly River Run": "Grizzly Peak",
    "Redwood Creek": "Grizzly Peak",
    "Goofy's Sky School": "Paradise Gardens",
    "Little Mermaid": "Paradise Gardens",
    "Silly Symphony Swings": "Paradise Gardens",
    "Jumpin' Jellyfish": "Paradise Gardens",
    "Golden Zephyr": "Paradise Gardens",
    "Monsters, Inc.": "Hollywood Land",
    "Animation Academy": "Hollywood Land",
    "Turtle Talk": "Hollywood Land",
    "PhilharMagic": "Hollywood Land",
};

// Ticket Tier Mapping (E = Top Tier, A = Lowest)
export const TICKET_MAPPING: Record<string, string> = {
    // E-Ticket (Headliners)
    "Star Wars: Rise of the Resistance": "E",
    "Radiator Springs Racers": "E",
    "Space Mountain": "E",
    "Indiana Jones": "E",
    "Pirates of the Caribbean": "E",
    "Haunted Mansion": "E",
    "Big Thunder Mountain Railroad": "E",
    "Guardians of the Galaxy": "E",
    "Incredicoaster": "E",
    "Soarin' Around the World": "E",
    "Tiana's Bayou Adventure": "E",
    "Mickey & Minnie's Runaway Railway": "E",
    "Millennium Falcon: Smugglers Run": "E",

    // D-Ticket (Major Attractions)
    "Matterhorn Bobsleds": "D",
    "Star Tours": "D",
    "Toy Story Midway Mania!": "D",
    "Jungle Cruise": "D",
    "WEB SLINGERS": "D",
    "Grizzly River Run": "D",
    "Roger Rabbit's Car Toon Spin": "D",
    "It's a Small World": "D",
    "Peter Pan's Flight": "D", // Often high wait, but originally C/D class

    // C-Ticket (Significant Rides)
    "Buzz Lightyear Astro Blasters": "C",
    "Monsters, Inc.": "C",
    "Goofy's Sky School": "C",
    "The Little Mermaid": "C",
    "Autopia": "C",
    "Alice in Wonderland": "C",
    "Mr. Toad's Wild Ride": "C",
    "Snow White's Enchanted Wish": "C",
    "Pinocchio's Daring Journey": "C",
    "Luigi's Rollickin' Roadsters": "C",
    "Mater's Junkyard Jamboree": "C",

    // B-Ticket (Minor Rides)
    "Dumbo the Flying Elephant": "B",
    "Mad Tea Party": "B",
    "Astro Orbitor": "B",
    "King Arthur Carrousel": "B",
    "Casey Jr. Circus Train": "B",
    "Storybook Land Canal Boats": "B",
    "Pixar Pal-A-Round": "B",
    "Silly Symphony Swings": "B",
    "Inside Out Emotional Whirlwind": "B",
    "Jumpin' Jellyfish": "B",
    "Golden Zephyr": "B",
    "GADGETcoaster": "B",

    // A-Ticket (Attractions/Walkthroughs)
    "Mark Twain Riverboat": "A",
    "Sailing Ship Columbia": "A",
    "Treehouse": "A",
    "Main Street Vehicles": "A",
    "Sleeping Beauty Castle Walkthrough": "A",
    "Enchanted Tiki Room": "A", // Assessing as show/attraction
    "Animation Academy": "A",
    "Turtle Talk": "A",
};

export function getLand(rideName: string): string {
    // 1. Exact match
    if (LAND_MAPPING[rideName]) return LAND_MAPPING[rideName];

    // 2. Partial match (Checking keys against rideName)
    const key = Object.keys(LAND_MAPPING).find(k => rideName.includes(k));
    if (key) return LAND_MAPPING[key];

    return "—";
}

export function getTicketClass(rideName: string): string {
    // 1. Exact match
    if (TICKET_MAPPING[rideName]) return TICKET_MAPPING[rideName];

    // 2. Partial match
    const key = Object.keys(TICKET_MAPPING).find(k => rideName.includes(k));
    if (key) return TICKET_MAPPING[key];

    return "—";
}
