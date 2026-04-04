import data from './ride-coords.json';

export interface RideCoord {
  lat: number;
  lng: number;
  name: string;
}

export const RIDE_COORDS: Record<string, RideCoord> = data as Record<string, RideCoord>;