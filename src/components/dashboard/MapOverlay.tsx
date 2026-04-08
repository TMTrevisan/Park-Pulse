"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Ride } from '@/lib/types';
import { Layers, Bug } from 'lucide-react';
import { clsx } from 'clsx';
import RIDE_COORDS_DATA from '@/lib/ride-coords.json';
import { ResortId, LAND_CENTROIDS } from '@/lib/parks';

const rawCoords = (RIDE_COORDS_DATA as any).default || RIDE_COORDS_DATA;
const RIDE_COORDS: Record<string, any> = rawCoords;

interface MapOverlayProps {
  rides: Ride[];
  selectedParkId: string;
  resort: ResortId;
  activeLand?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const RESORT_VIEWPORTS: Record<ResortId, { latitude: number; longitude: number; zoom: number }> = {
  DLR: { latitude: 33.8115, longitude: -117.9190, zoom: 15.0 },
  WDW: { latitude: 28.4180, longitude: -81.5812, zoom: 15.0 }, // Magic Kingdom default
};

export default function MapOverlay({ rides, selectedParkId, resort, activeLand }: MapOverlayProps) {
  const mapRef = useRef<MapRef>(null);
  const defaultView = RESORT_VIEWPORTS[resort];
  
  const [viewState, setViewState] = useState({
    ...defaultView,
    pitch: 45,
    bearing: 0,
  });

  // 1. Sync viewState on resort change
  useEffect(() => {
    setViewState({
      ...RESORT_VIEWPORTS[resort],
      pitch: 45,
      bearing: 0,
    });
  }, [resort]);

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
       // Reset to park default when "All" is selected
       mapRef.current?.flyTo({
        center: [defaultView.longitude, defaultView.latitude],
        zoom: defaultView.zoom,
        duration: 2000
      });
    }
  }, [activeLand, defaultView]);

  const [mapStyle, setMapStyle] = useState<'streets-v12' | 'satellite-streets-v12'>('streets-v12');
  const [hoveredRide, setHoveredRide] = useState<Ride | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  const mappedRides = useMemo(() => {
    return rides.filter(r => {
      if (!RIDE_COORDS[r.id]) return false;
      // Filter by land if one is selected
      if (activeLand && activeLand !== 'All') {
          // If we are filtering, we only show markers for that land
          // This makes the map less cluttered after zooming
          const { getLand } = require('@/lib/parks');
          if (getLand(r.name, resort) !== activeLand) return false;
      }
      return r.status === "OPERATING" || r.status === "DOWN";
    });
  }, [rides, activeLand, resort]);

  const getWaitColor = (minutes: number, status?: string) => {
    if (status === "DOWN") return 'bg-zinc-800 text-rose-500 border-rose-500/50';
    if (minutes <= 15) return 'bg-emerald-500 text-white';
    if (minutes <= 35) return 'bg-amber-400 text-black';
    if (minutes <= 60) return 'bg-orange-500 text-white';
    return 'bg-rose-600 text-white';
  };

  return (
    <div className="relative w-full h-[600px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-[#0f1115]">
      <Map
        {...viewState}
        ref={mapRef}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={`mapbox://styles/mapbox/${mapStyle}`}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        antialias={true}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />

        {mappedRides.map(ride => {
          const coords = RIDE_COORDS[ride.id];
          const waitTime = ride.queue?.STANDBY?.waitTime ?? 0;

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
                className="group relative cursor-pointer transition-transform hover:scale-110 active:scale-95"
                onMouseEnter={() => setHoveredRide(ride)}
                onMouseLeave={() => setHoveredRide(null)}
              >
                <div className={clsx(
                  "flex items-center justify-center px-2 py-1 rounded-full text-[11px] font-black shadow-2xl border-2 min-w-[34px] h-[34px] transition-all",
                  getWaitColor(waitTime, ride.status),
                  hoveredRide?.id === ride.id ? "scale-125 ring-4 ring-white/20" : ""
                )}>
                  {ride.status === "DOWN" ? "!" : waitTime}
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-50">
                  <div className="bg-black/90 text-[10px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-xl whitespace-nowrap backdrop-blur-md border border-white/20 shadow-2xl">
                    {ride.name}
                  </div>
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
            maxWidth="200px"
          >
            <div className="p-1">
              <div className="text-xs font-black text-zinc-900 leading-tight mb-1 uppercase tracking-tight">{hoveredRide.name}</div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase">
                <div className={clsx(
                  "w-2 h-2 rounded-full",
                  hoveredRide.status === "OPERATING" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500"
                )} />
                {hoveredRide.status === "OPERATING" ? "Operating" : "Down"}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Map Content Overlays */}
      <div className="absolute top-6 left-6 flex flex-col gap-3">
        <button
          onClick={() => setMapStyle(mapStyle === 'streets-v12' ? 'satellite-streets-v12' : 'streets-v12')}
          className="flex items-center gap-2 px-4 py-2.5 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest hover:bg-black/80 transition-all shadow-2xl group ring-1 ring-white/5"
        >
          <Layers className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
          {mapStyle === 'streets-v12' ? 'Satellite' : 'Standard'}
        </button>

        <button
          onClick={() => setDebugMode(d => !d)}
          className={clsx(
            "flex items-center gap-2 px-4 py-2.5 backdrop-blur-2xl border rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl ring-1",
            debugMode
              ? "bg-rose-600/80 border-rose-400/40 text-white ring-rose-500/50"
              : "bg-black/60 border-white/10 text-zinc-400 hover:text-white hover:bg-black/80 ring-white/5"
          )}
        >
          <Bug className="w-4 h-4" />
          Debug
        </button>
      </div>

      {/* Interactive Legend */}
      <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl shadow-2xl ring-1 ring-white/10">
        <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black mb-3 ml-1">Live Pulse</div>
        <div className="flex flex-col gap-2.5">
          <LegendItem color="bg-emerald-500" label="Walk-on" />
          <LegendItem color="bg-amber-400" label="Moderate" />
          <LegendItem color="bg-orange-500" label="Busy" />
          <LegendItem color="bg-rose-600" label="Long Wait" />
          <LegendItem color="bg-zinc-800 border-rose-500/50" label="Down" />
        </div>
      </div>

      <style jsx global>{`
        .mapboxgl-popup-content {
          background: white !important;
          border-radius: 1.25rem !important;
          padding: 1rem !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
          border: 1px solid rgba(0,0,0,0.05) !important;
        }
        .mapboxgl-popup-tip { display: none !important; }
      `}</style>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className={clsx("w-3 h-3 rounded-full flex-shrink-0 shadow-inner", color)} />
      <span className="text-[10px] text-white/90 font-black uppercase tracking-tighter">{label}</span>
    </div>
  );
}
