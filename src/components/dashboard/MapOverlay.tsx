"use client";

import React, { useState, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Ride } from '@/lib/types';
import { Layers, Bug } from 'lucide-react';
import { clsx } from 'clsx';
import RIDE_COORDS_DATA from '@/lib/ride-coords.json';
import type { ResortId } from '@/lib/parks';

// Handle Next.js/Webpack ES module interop defensively
const rawCoords = (RIDE_COORDS_DATA as any).default || RIDE_COORDS_DATA;
const RIDE_COORDS: Record<string, any> = rawCoords;

interface MapOverlayProps {
  rides: Ride[];
  selectedParkId: string;
  resort: ResortId;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const RESORT_VIEWPORTS: Record<ResortId, { latitude: number; longitude: number; zoom: number }> = {
  DLR: { latitude: 33.8091, longitude: -117.9190, zoom: 15.2 },
  WDW: { latitude: 28.3852, longitude: -81.5639, zoom: 13.5 },
};

export default function MapOverlay({ rides, selectedParkId, resort }: MapOverlayProps) {
  const defaultView = RESORT_VIEWPORTS[resort];
  const [viewState, setViewState] = useState({
    ...defaultView,
    pitch: 45,
    bearing: 0,
  });

  // Sync viewState when resort changes
  React.useEffect(() => {
    setViewState({
      ...RESORT_VIEWPORTS[resort],
      pitch: 45,
      bearing: 0,
    });
  }, [resort]);

  const [mapStyle, setMapStyle] = useState<'streets-v12' | 'satellite-streets-v12'>('streets-v12');
  const [hoveredRide, setHoveredRide] = useState<Ride | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  const mappedRides = useMemo(() => {
    return rides.filter(r => {
      if (!RIDE_COORDS[r.id]) return false;
      if (r.status !== "OPERATING") return false;           // auto-hide closed rides
      const waitTime = r.queue?.STANDBY?.waitTime ?? 0;
      return waitTime > 0;
    });
  }, [rides]);

  const getWaitColor = (minutes: number) => {
    if (minutes <= 15) return 'bg-emerald-500 text-white';
    if (minutes <= 35) return 'bg-amber-400 text-black';
    if (minutes <= 60) return 'bg-orange-500 text-white';
    return 'bg-rose-600 text-white';
  };

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0f1115]">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={`mapbox://styles/mapbox/${mapStyle}`}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
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
                className="group relative cursor-pointer transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredRide(ride)}
                onMouseLeave={() => setHoveredRide(null)}
              >
                <div className={clsx(
                  "flex items-center justify-center px-2 py-1 rounded-full text-[10px] font-bold shadow-lg border-2 border-white/20 min-w-[32px] h-[32px]",
                  getWaitColor(waitTime)
                )}>
                  {waitTime}
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                  <div className="bg-black/90 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap backdrop-blur-md border border-white/10">
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
              <div className="text-xs font-bold text-zinc-900 leading-tight mb-1">{hoveredRide.name}</div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                <div className={clsx(
                  "w-1.5 h-1.5 rounded-full pulse",
                  hoveredRide.status === "OPERATING" ? "bg-emerald-500" : "bg-zinc-400"
                )} />
                {hoveredRide.status === "OPERATING" ? "Operating Now" : "Currently Closed"}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Map Style Toggle */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <button
          onClick={() => setMapStyle(mapStyle === 'streets-v12' ? 'satellite-streets-v12' : 'streets-v12')}
          className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl text-white text-xs font-medium hover:bg-black/80 transition-all shadow-xl group"
        >
          <Layers className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
          {mapStyle === 'streets-v12' ? 'Satellite View' : 'Standard View'}
        </button>

        {/* Debug Toggle Button */}
        <button
          onClick={() => setDebugMode(d => !d)}
          className={clsx(
            "flex items-center gap-2 px-3 py-2 backdrop-blur-xl border rounded-xl text-xs font-medium transition-all shadow-xl",
            debugMode
              ? "bg-rose-600/80 border-rose-400/40 text-white"
              : "bg-black/60 border-white/10 text-zinc-400 hover:text-white hover:bg-black/80"
          )}
          title="Toggle debug info"
        >
          <Bug className="w-4 h-4" />
          {debugMode ? 'Debug ON' : 'Debug'}
        </button>
      </div>

      {/* Debug Panel */}
      {debugMode && (
        <div className="absolute top-4 left-[200px] bg-black/80 backdrop-blur-xl border border-rose-500/40 text-rose-300 p-3 z-50 text-xs rounded-xl font-mono shadow-2xl space-y-1">
          <div className="text-rose-400 font-bold mb-1 flex items-center gap-1">
            <Bug className="w-3 h-3" /> Debug Info
          </div>
          <div>Total rides received: <span className="text-white">{rides.length}</span></div>
          <div>Rides with coords + wait time: <span className="text-white">{mappedRides.length}</span></div>
          <div>Coord registry size: <span className="text-white">{Object.keys(RIDE_COORDS).length}</span></div>
          <div>Map style: <span className="text-white">{mapStyle}</span></div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-xl">
        <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-2">Busyness Index</div>
        <div className="flex flex-col gap-1.5">
          <LegendItem color="bg-emerald-500" label="Walk-on (≤15 min)" />
          <LegendItem color="bg-amber-400" label="Moderate (≤35 min)" />
          <LegendItem color="bg-orange-500" label="Busy (≤60 min)" />
          <LegendItem color="bg-rose-600" label="Very Long (60+ min)" />
        </div>
      </div>

      <style jsx global>{`
        .mapboxgl-popup-content {
          background: white !important;
          border-radius: 12px !important;
          padding: 8px !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
          border: 1px solid rgba(0,0,0,0.05) !important;
        }
        .mapboxgl-popup-tip {
          display: none !important;
        }
        .pulse {
          animation: pulse-animation 2s infinite;
        }
        @keyframes pulse-animation {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={clsx("w-2 h-2 rounded-full flex-shrink-0", color)} />
      <span className="text-[10px] text-white/80 font-medium">{label}</span>
    </div>
  );
}
