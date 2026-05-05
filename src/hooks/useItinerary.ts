import { useState, useEffect } from 'react';

export interface ItineraryItem {
    id: string; // unique ID for this instance in the list
    rideId: string;
    completed: boolean;
    completedAt?: number;
}

export interface SavedStrategy {
    id: string;
    name: string;
    items: ItineraryItem[];
}

export interface RopeDropState {
    items: ItineraryItem[];
    simulationStartTime: number | null; // e.g. timestamp for 8:00 AM simulation, null = Live
    savedStrategies: SavedStrategy[];
}

export function useItinerary(resort: string) {
    const STORAGE_KEY = `park-pulse-itinerary-${resort}`;
    
    const [state, setState] = useState<RopeDropState>({
        items: [],
        simulationStartTime: null,
        savedStrategies: []
    });

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setState({
                    items: parsed.items || [],
                    simulationStartTime: parsed.simulationStartTime || null,
                    savedStrategies: parsed.savedStrategies || []
                });
            } catch (e) {
                console.error("Failed to parse itinerary", e);
            }
        }
        setIsLoaded(true);
    }, [STORAGE_KEY]);

    const saveState = (newState: RopeDropState) => {
        setState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    };

    const addItem = (rideId: string) => {
        const newItem: ItineraryItem = {
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
            rideId,
            completed: false
        };
        saveState({
            ...state,
            items: [...state.items, newItem]
        });
    };

    const removeItem = (id: string) => {
        saveState({
            ...state,
            items: state.items.filter(item => item.id !== id)
        });
    };

    const toggleComplete = (id: string) => {
        saveState({
            ...state,
            items: state.items.map(item => {
                if (item.id === id) {
                    return {
                        ...item,
                        completed: !item.completed,
                        completedAt: !item.completed ? Date.now() : undefined
                    };
                }
                return item;
            })
        });
    };

    const reorderItems = (startIndex: number, endIndex: number) => {
        const result = Array.from(state.items);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        
        saveState({
            ...state,
            items: result
        });
    };
    
    const setSimulationTime = (time: number | null) => {
        saveState({
            ...state,
            simulationStartTime: time
        });
    };

    const clearItinerary = () => {
        saveState({
            ...state,
            items: [],
            simulationStartTime: null
        });
    };

    const saveCurrentStrategy = (name: string) => {
        const newStrategy: SavedStrategy = {
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
            name,
            items: state.items
        };
        saveState({
            ...state,
            savedStrategies: [...state.savedStrategies, newStrategy]
        });
    };

    const loadStrategy = (id: string) => {
        const strategy = state.savedStrategies.find(s => s.id === id);
        if (strategy) {
            saveState({
                ...state,
                items: strategy.items,
                // keep simulation mode as is or reset? Resetting makes sense.
                simulationStartTime: null 
            });
        }
    };

    const deleteStrategy = (id: string) => {
        saveState({
            ...state,
            savedStrategies: state.savedStrategies.filter(s => s.id !== id)
        });
    };

    return {
        itinerary: state.items,
        simulationStartTime: state.simulationStartTime,
        savedStrategies: state.savedStrategies,
        isLoaded,
        addItem,
        removeItem,
        toggleComplete,
        reorderItems,
        setSimulationTime,
        clearItinerary,
        saveCurrentStrategy,
        loadStrategy,
        deleteStrategy
    };
}
