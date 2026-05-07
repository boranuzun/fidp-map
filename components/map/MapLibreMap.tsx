'use client';

import { useEffect, useMemo, useRef } from 'react';
import Map, { Marker, Source, Layer, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useLocalStorage } from '../../hooks/use-local-storage';
import { MapProps } from './types';
import { MAP_THEME } from '../../lib/map-config';
import { MapTheme } from '../../lib/map-config';

// Mute MapLibre's persistent "Image could not be loaded" warnings which are caused by 
// inconsistencies in the remote OpenFreeMap styles.
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;
  const filter = (args: any[]) => 
    args[0] && typeof args[0] === 'string' && 
    args[0].includes('Image') && args[0].includes('could not be loaded');

  console.warn = (...args) => {
    if (filter(args)) return;
    originalWarn(...args);
  };
  console.error = (...args) => {
    if (filter(args)) return;
    originalError(...args);
  };
}

interface MapSettings {
  showProperties: boolean;
  showBuildingLayouts: boolean;
  mapTheme: MapTheme;
}

const DEFAULT_SETTINGS: MapSettings = {
  showProperties: true,
  showBuildingLayouts: false,
  mapTheme: MAP_THEME,
};

const THEME_COLORS: Record<MapTheme, string> = {
  liberty: '#5D60BE',
  bright: '#1a73e8',
  positron: '#333333',
};

export default function MapLibreMap({ 
  properties, 
  onSelect, 
  selectedProperty,
  onHover,
  dict
}: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const [settings, setSettings] = useLocalStorage<MapSettings>('fidp-map-settings', DEFAULT_SETTINGS);

  const initialViewState = {
    longitude: 6.1432,
    latitude: 46.2044,
    zoom: 13
  };

  // Center on selected property
  useEffect(() => {
    if (selectedProperty?.lat && selectedProperty?.lng && mapRef.current) {
      // The side drawer (Sheet) is roughly 448px wide on desktop (max-w-md).
      // We use padding to tell MapLibre to center the point in the remaining visible area.
      mapRef.current.flyTo({
        center: [selectedProperty.lng, selectedProperty.lat],
        zoom: 18,
        padding: { right: 448, top: 0, bottom: 0, left: 0 },
        essential: true,
        duration: 1000
      });
    }
  }, [selectedProperty?.id, selectedProperty?.lat, selectedProperty?.lng]);

  const geojsonData = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: properties
      .filter(p => p.geometry)
      .map(p => {
        try {
          const geometry = JSON.parse(p.geometry!);
          return {
            type: 'Feature' as const,
            id: p.id,
            geometry,
            properties: { id: p.id }
          };
        } catch {
          return null;
        }
      })
      .filter((f): f is NonNullable<typeof f> => f !== null)
  }), [properties]);

  return (
    <div className="relative h-full w-full">
      <div className="h-full w-full">
        <Map
          ref={mapRef}
          initialViewState={initialViewState}
          style={{ width: '100%', height: '100%' }}
          mapStyle={`https://tiles.openfreemap.org/styles/${settings.mapTheme || MAP_THEME}`}
          onStyleImageMissing={(e) => {
            const id = e.id;
            if (!e.target.hasImage(id)) {
              e.target.addImage(id, {
                width: 1,
                height: 1,
                data: new Uint8Array([0, 0, 0, 0])
              });
            }
          }}
        >
          {/* Inject Building Numbers Layer */}
          <Layer
            id="house-numbers"
            type="symbol"
            source="openmaptiles"
            source-layer="housenumber"
            minzoom={17}
            layout={{
              'text-field': '{housenumber}',
              'text-font': ['Noto Sans Regular'],
              'text-size': 10,
              'text-padding': 1,
            }}
            paint={{
              'text-color': 'rgba(0, 0, 0, 0.6)',
              'text-halo-color': 'rgba(255, 255, 255, 0.8)',
              'text-halo-width': 1,
            }}
          />

          {settings.showProperties && properties.filter(p => p.lat && p.lng).map((p) => {
            const isSelected = selectedProperty?.id === p.id;
            return (
              <Marker 
                key={p.id} 
                longitude={p.lng!} 
                latitude={p.lat!}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  onSelect(p);
                }}
              >
                <div 
                  className={`group cursor-pointer transition-all duration-300 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}`}
                  onMouseEnter={() => onHover?.(p)}
                >
                  <svg 
                    width="32" 
                    height="42" 
                    viewBox="0 0 24 32" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-md"
                  >
                    <path 
                      d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z" 
                      fill={isSelected ? '#000000' : THEME_COLORS[settings.mapTheme || MAP_THEME]}
                      stroke={isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)'}
                      strokeWidth="1.5"
                    />
                    <circle cx="12" cy="12" r="4" fill="white" />
                  </svg>
                </div>
              </Marker>
            );
          })}

          {settings.showBuildingLayouts && (
            <Source type="geojson" data={geojsonData}>
              <Layer
                id="building-layouts"
                type="fill"
                minzoom={16}
                paint={{
                  'fill-color': '#000',
                  'fill-opacity': [
                    'case',
                    ['==', ['get', 'id'], selectedProperty?.id || -1],
                    0.3,
                    0.1
                  ]
                }}
              />
              <Layer
                id="building-borders"
                type="line"
                minzoom={16}
                paint={{
                  'line-color': '#000',
                  'line-width': [
                    'case',
                    ['==', ['get', 'id'], selectedProperty?.id || -1],
                    3,
                    1
                  ]
                }}
              />
            </Source>
          )}
        </Map>
      </div>
      
      {/* Simple toggle UI for settings (since MapLibre doesn't have a built-in LayersControl like Leaflet) */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 border border-black shadow-sm flex flex-col gap-3 z-10 text-xs font-mono">
        <div className="flex flex-col gap-1 border-b border-black/10 pb-2">
          <span className="text-[9px] font-bold opacity-40 uppercase tracking-tighter">Theme</span>
          <select 
            value={settings.mapTheme || MAP_THEME}
            onChange={(e) => {
              const theme = e.target.value as MapTheme;
              setSettings(prev => ({ ...prev, mapTheme: theme }));
            }}
            className="bg-transparent border border-black/20 p-1 focus:outline-none"
          >
            <option value="liberty">Liberty</option>
            <option value="bright">Bright</option>
            <option value="positron">Positron</option>
          </select>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.showProperties} 
              onChange={(e) => setSettings(prev => ({ ...prev, showProperties: e.target.checked }))}
            />
            {dict.layers.properties}
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.showBuildingLayouts} 
              onChange={(e) => setSettings(prev => ({ ...prev, showBuildingLayouts: e.target.checked }))}
            />
            {dict.layers.buildingLayouts}
          </label>
        </div>
      </div>
    </div>
  );
}
