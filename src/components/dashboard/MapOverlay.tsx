"use client";

import React, { useState, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Ride } from '@/lib/types';
import { RIDE_COORDS } from '@/lib/ride-coords';
import { Layers } from 'lucide-react';
import { clsx } from 'clsx';

interface MapOverlayProps {
  rides: Ride[];
  selectedParkId: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function MapOverlay({ rides, selectedParkId }: MapOverlayProps) {
  const [viewState, setViewState] = useState({
    latitude: selectedParkId === "7340550b-c14d-4def-80bb-acdb51d49a66" ? 33.8121 : 33.8061,
    longitude: selectedParkId === "7340550b-c14d-4def-80bb-acdb51d49a66" ? -117.9190 : -117.9190,
    zoom: 16,
    pitch: 45,
    bearing: 0
  });

  const [mapStyle, setMapStyle] = useState<'streets-v12' | 'satellite-streets-v12'>('streets-v12');
  const [hoveredRide, setHoveredRide] = useState<Ride | null>(null);

  const mappedRides = useMemo(() => {
    return rides.filter(r => {
      if (!RIDE_COORDS[r.id]) return false;
      if (r.status === "OPERATING") {
        const waitTime = r.queue?.STANDBY?.waitTime ?? 0;
        return waitTime > 0;
      }
      return true;
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
          const isClosed = ride.status !== "OPERATING";

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
                className={clsx(
                  "group relative cursor-pointer transition-transform hover:scale-110",
                  isClosed ? "opacity-60" : "opacity-100"
                )}
                onMouseEnter={() => setHoveredRide(ride)}
                onMouseLeave={() => setHoveredRide(null)}
              >
                <div className={clsx(
                  "flex items-center justify-center px-2 py-1 rounded-full text-[10px] font-bold shadow-lg border-2 border-white/20 min-w-[32px] h-[32px]",
                  isClosed ? "bg-zinc-700 text-zinc-300" : getWaitColor(waitTime)
                )}>
                  {isClosed ? "—" : waitTime}
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

      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <button
          onClick={() => setMapStyle(mapStyle === 'streets-v12' ? 'satellite-streets-v12' : 'streets-v12')}
          className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl text-white text-xs font-medium hover:bg-black/80 transition-all shadow-xl group"
        >
          <Layers className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
          {mapStyle === 'streets-v12' ? 'Satellite View' : 'Standard View'}
        </button>
      </div>

      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-xl">
        <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-2">Busyness Index</div>
        <div className="flex flex-col gap-1.5">
          <LegendItem color="bg-emerald-500" label="Walk-on" />
          <LegendItem color="bg-amber-400" label="Moderate" />
          <LegendItem color="bg-orange-500" label="Busy" />
          <LegendItem color="bg-rose-600" label="Very Long" />
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
      <div className={clsx("w-2 h-2 rounded-full", color)} />
      <span className="text-[10px] text-white/80 font-medium">{label}</span>
    </div>
  );
}
