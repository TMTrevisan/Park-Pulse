"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Ride } from '@/lib/types';
import { Layers, Bug } from 'lucide-react';
import { clsx } from 'clsx';
import RIDE_COORDS_DATA from '@/lib/ride-coords.json';
import { ResortId, LAND_CENTROIDS, PARKS } from '@/lib/parks';

const rawCoords = (RIDE_COORDS_DATA as any).default || RIDE_COORDS_DATA;
const RIDE_COORDS: Record<string, any> = rawCoords;

interface MapOverlayProps {
  rides: Ride[];
  selectedParkId: string;
  resort: ResortId;
  activeLand?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const PARK_VIEWPORTS: Record<string, { latitude: number; longitude: number; zoom: number }> = {
  [PARKS.DISNEYLAND_PARK]: { latitude: 33.8121, longitude: -117.9190, zoom: 16.0 },
  [PARKS.DISNEY_CALIFORNIA_ADVENTURE]: { latitude: 33.8061, longitude: -117.9190, zoom: 16.0 },
  [PARKS.MAGIC_KINGDOM]: { latitude: 28.4178, longitude: -81.5812, zoom: 16.0 },
  [PARKS.EPCOT]: { latitude: 28.3747, longitude: -81.5494, zoom: 15.5 },
  [PARKS.HOLLYWOOD_STUDIOS]: { latitude: 28.3575, longitude: -81.5583, zoom: 16.2 },
  [PARKS.ANIMAL_KINGDOM]: { latitude: 28.3585, longitude: -81.5907, zoom: 15.8 },
};

const RESORT_VIEWPORTS: Record<ResortId, { latitude: number; longitude: number; zoom: number }> = {
  DLR: { latitude: 33.8115, longitude: -117.9190, zoom: 15.0 },
  WDW: { latitude: 28.3852, longitude: -81.5639, zoom: 13.0 },
};

export default function MapOverlay({ rides, selectedParkId, resort, activeLand }: MapOverlayProps) {
  const mapRef = useRef<MapRef>(null);
  
  const [viewState, setViewState] = useState({
    ...RESORT_VIEWPORTS[resort],
    pitch: 45,
    bearing: 0,
  });

  // 1. Zoom to Park when selectedParkId changes
  useEffect(() => {
    const parkViewport = PARK_VIEWPORTS[selectedParkId];
    if (parkViewport) {
      mapRef.current?.flyTo({
        center: [parkViewport.longitude, parkViewport.latitude],
        zoom: parkViewport.zoom,
        duration: 2000,
        essential: true
      });
    }
  }, [selectedParkId]);

  // 2. Fly to specific land when activeLand changes
  useEffect(() => {
    if (activeLand && activeLand !== 'All' && LAND_CENTROIDS[activeLand]) {
      const centroid = LAND_CENTROIDS[activeLand];
      mapRef.current?.flyTo({
        center: [centroid.lng, centroid.lat],
        zoom: centroid.zoom,
        duration: 2500,
        essential: true
      });
    } else if (activeLand === 'All') {
       // Return to park-level view if "All" is selected
       const parkViewport = PARK_VIEWPORTS[selectedParkId];
       if (parkViewport) {
          mapRef.current?.flyTo({
            center: [parkViewport.longitude, parkViewport.latitude],
            zoom: parkViewport.zoom,
            duration: 1500
          });
       }
    }
  }, [activeLand, selectedParkId]);

  const [mapStyle, setMapStyle] = useState<'streets-v12' | 'satellite-streets-v12'>('streets-v12');
  const [hoveredRide, setHoveredRide] = useState<Ride | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  const mappedRides = useMemo(() => {
    return rides.filter(r => {
      if (!RIDE_COORDS[r.id]) return false;
      return r.status === "OPERATING" || r.status === "DOWN";
    });
  }, [rides]);

  const getWaitColor = (minutes: number, status?: string) => {
    if (status === "DOWN") return 'bg-zinc-800 text-rose-500 border-rose-500/50';
    if (minutes <= 15) return 'bg-emerald-500 text-white border-emerald-400/30';
    if (minutes <= 35) return 'bg-amber-400 text-black border-amber-300/30';
    if (minutes <= 60) return 'bg-orange-500 text-white border-orange-400/30';
    return 'bg-rose-600 text-white border-rose-500/30';
  };

  return (
    <div className="relative w-full h-[600px] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-[#0f1115]">
      <Map
        {...viewState}
        ref={mapRef}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={`mapbox://styles/mapbox/${mapStyle}?optimize=true`}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        antialias={true}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />

        {mappedRides.map(ride => {
          const coords = RIDE_COORDS[ride.id];
          const waitTime = ride.queue?.STANDBY?.waitTime ?? 0;
          const isSelected = hoveredRide?.id === ride.id;

          return (
            <Marker
              key={ride.id}
              latitude={coords.lat}
              longitude={coords.lng}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setHoveredRide(ride);
              }}
            >
              <div
                className="group relative cursor-pointer translate-y-[-50%]"
                onMouseEnter={() => setHoveredRide(ride)}
                onMouseLeave={() => setHoveredRide(null)}
              >
                <div className={clsx(
                  "flex items-center justify-center px-1.5 py-1.5 rounded-full text-[11px] font-black shadow-2xl border-2 transition-all duration-300",
                  getWaitColor(waitTime, ride.status),
                  isSelected ? "scale-150 z-50 ring-4 ring-white/30" : "scale-100 hover:scale-110"
                )}>
                   <span className="min-w-[20px] text-center">
                    {ride.status === "DOWN" ? "!" : waitTime}
                   </span>
                </div>
                
                {/* Floating Tooltip */}
                <div className={clsx(
                    "absolute bottom-full left-1/2 -translate-x-1/2 mb-4 pointer-events-none transition-all duration-300",
                    isSelected ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-90"
                )}>
                  <div className="bg-black/95 text-[10px] font-black uppercase tracking-tighter px-4 py-2 rounded-2xl whitespace-nowrap backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                    {ride.name}
                  </div>
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/95 mx-auto -mt-0.5" />
                </div>
              </div>
            </Marker>
          );
        })}

        {hoveredRide && (
          <Popup
            latitude={RIDE_COORDS[hoveredRide.id].lat}
            longitude={RIDE_COORDS[hoveredRide.id].lng}
            anchor="top"
            onClose={() => setHoveredRide(null)}
            closeButton={false}
            className="ride-popup"
            maxWidth="220px"
          >
            <div className="p-1">
              <div className="text-xs font-black text-zinc-900 leading-tight mb-1 uppercase tracking-tight">{hoveredRide.name}</div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase">
                <div className={clsx(
                  "w-2 h-2 rounded-full",
                  hoveredRide.status === "OPERATING" ? "bg-emerald-500" : "bg-rose-500"
                )} />
                {hoveredRide.status === "OPERATING" ? "Operating" : "Currently Down"}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Modern Overlay UI */}
      <div className="absolute top-8 left-8 flex flex-col gap-3">
        <button
          onClick={() => setMapStyle(mapStyle === 'streets-v12' ? 'satellite-streets-v12' : 'streets-v12')}
          className="flex items-center gap-3 px-5 py-3 bg-black/70 backdrop-blur-2xl border border-white/10 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest hover:bg-black/90 transition-all shadow-2xl ring-1 ring-white/5 active:scale-95"
        >
          <Layers className="w-4 h-4 text-blue-400" />
          {mapStyle === 'streets-v12' ? 'Satellite' : 'Standard'}
        </button>
      </div>

      {/* High-Fi Legend */}
      <div className="absolute bottom-8 right-8 bg-black/70 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] shadow-2xl ring-1 ring-white/5">
        <div className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-black mb-4 ml-1">Live Status</div>
        <div className="flex flex-col gap-3">
          <LegendItem color="bg-emerald-500" label="Walk-on" />
          <LegendItem color="bg-amber-400" label="Moderate" />
          <LegendItem color="bg-orange-500" label="Busy" />
          <LegendItem color="bg-rose-600" label="At Peak" />
          <LegendItem color="bg-zinc-800" label="System Down" />
        </div>
      </div>

      <style jsx global>{`
        .mapboxgl-popup-content {
          background: white !important;
          border-radius: 1.5rem !important;
          padding: 1.25rem !important;
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.45) !important;
          border: 1px solid rgba(0,0,0,0.05) !important;
        }
        .mapboxgl-popup-tip { display: none !important; }
      `}</style>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-4 px-1">
      <div className={clsx("w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-inner ring-2 ring-white/10", color)} />
      <span className="text-[10px] text-white/80 font-black uppercase tracking-tighter">{label}</span>
    </div>
  );
}
