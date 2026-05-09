'use client';

import { useEffect, useMemo, useRef } from 'react';
import Map, { Marker, Source, Layer, MapRef, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, MapPin, LayoutDashboard } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useLocalStorage } from '../../hooks/use-local-storage';
import { MapProps, Property } from './types';

export type MapTheme = "liberty" | "bright" | "positron" | "satellite"
export const MAP_THEME: MapTheme = "liberty"

const SATELLITE_STYLE = {
  version: 8,
  sources: {
    'arcgis-satellite': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics, and the GIS User Community'
    }
  },
  layers: [
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'arcgis-satellite',
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

// Mute MapLibre's persistent "Image could not be loaded" warnings
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;
  const filter = (args: unknown[]) => 
    args[0] && typeof args[0] === 'string' && 
    args[0].includes('Image') && args[0].includes('could not be loaded');

  console.warn = (...args: unknown[]) => {
    if (filter(args)) return;
    originalWarn(...args);
  };
  console.error = (...args: unknown[]) => {
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
  satellite: '#0ea5e9', // Vibrant Sky Blue for satellite
};

const pendingPins = new globalThis.Map<string, Promise<HTMLImageElement>>();

const generatePinIcon = (color: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const svg = `
      <svg width="32" height="42" viewBox="-2 -2 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="${color}" stroke="white" stroke-width="1.5"/>
        <circle cx="12" cy="12" r="4" fill="white" />
      </svg>
    `;
    
    const img = new Image();
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
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
      // The new sidebars are on the left (400px) and right (450px).
      // We use padding to tell MapLibre to center the point in the remaining visible area.
      mapRef.current.flyTo({
        center: [selectedProperty.lng, selectedProperty.lat],
        zoom: 18,
        padding: { left: 400, right: 450, top: 0, bottom: 0 },
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
    <div className="relative h-full w-full overflow-hidden">
      <div className="h-full w-full">
        <Map
          ref={mapRef}
          initialViewState={initialViewState}
          style={{ width: '100%', height: '100%' }}
          mapStyle={settings.mapTheme === 'satellite' 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? (SATELLITE_STYLE as any) 
            : `https://tiles.openfreemap.org/styles/${settings.mapTheme || MAP_THEME}`
          }
          onClick={(e: MapLayerMouseEvent) => {
            // Only clear selection if we click on the map itself, not a marker
            if (e.target.getCanvas().contains(e.originalEvent.target as Node)) {
              onSelect(null as unknown as Property);
            }
          }}
          onLoad={(e) => {
            e.target.on('styleimagemissing', async (ev: { id: string }) => {
              const id = ev.id;
              if (id.startsWith('pin-')) {
                if (e.target.hasImage(id)) return;

                const theme = id.replace('pin-', '');
                let color = '#000000'; // Default / selected
                if (theme === 'satellite') color = '#0ea5e9';
                else if (THEME_COLORS[theme as MapTheme]) color = THEME_COLORS[theme as MapTheme];
                
                try {
                  let imgPromise = pendingPins.get(id);
                  if (!imgPromise) {
                    imgPromise = generatePinIcon(color);
                    pendingPins.set(id, imgPromise);
                  }
                  
                  const img = await imgPromise;
                  
                  if (!e.target.hasImage(id)) {
                    e.target.addImage(id, img);
                  }
                } catch (err) {
                  console.error(`Failed to generate pin icon for ${id}:`, err);
                } finally {
                  pendingPins.delete(id);
                }
              } else if (!e.target.hasImage(id)) {
                e.target.addImage(id, {
                  width: 1,
                  height: 1,
                  data: new Uint8Array([0, 0, 0, 0])
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any);
              }
            });
          }}
        >
          {/* Inject Building Numbers Layer - only if not in satellite mode */}
          {settings.mapTheme !== 'satellite' && (
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
          )}

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
                    viewBox="-2 -2 28 36" // Added padding to prevent stroke clipping
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-md"
                  >
                    <path 
                      d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z" 
                      fill={
                        isSelected 
                          ? '#000000' 
                          : settings.mapTheme === 'satellite'
                            ? '#0ea5e9' // Vibrant Sky Blue for satellite
                            : THEME_COLORS[settings.mapTheme || MAP_THEME]
                      }
                      stroke={
                        isSelected 
                          ? '#FFFFFF' 
                          : settings.mapTheme === 'satellite'
                            ? '#FFFFFF' // White border for satellite
                            : 'rgba(255, 255, 255, 0.4)'
                      }
                      strokeWidth={settings.mapTheme === 'satellite' ? '2' : '1.5'}
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
      
      {/* Floating Glassy Map Controls */}
      <div 
        className="absolute top-4 right-4 z-20 flex flex-col gap-2 transition-all duration-500 ease-in-out"
        style={{ 
          transform: selectedProperty ? 'translateX(calc(-450px - 1rem))' : 'translateX(0)' 
        }}
      >
        <TooltipProvider>
          {/* Theme Selector Dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost" 
                    size="icon"
                    className="size-10 bg-glass backdrop-blur-md rounded-full shadow-lg border border-glass-border flex items-center justify-center transition-all hover:bg-glass/80 text-foreground cursor-pointer"
                  >
                    <Layers className={`size-5 ${settings.mapTheme !== 'positron' ? 'text-active-icon' : 'text-foreground'}`} />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="left" className="font-bold uppercase tracking-widest text-[10px]">
                {dict.layers.style}
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent side="left" align="start" sideOffset={12} className="bg-glass backdrop-blur-xl border-glass-border rounded-xl shadow-2xl">
              <DropdownMenuRadioGroup 
                value={settings.mapTheme || MAP_THEME} 
                onValueChange={(val) => setSettings(prev => ({ ...prev, mapTheme: val as MapTheme }))}
              >
                <DropdownMenuRadioItem value="liberty" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">
                  Liberty
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="bright" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">
                  Bright
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="positron" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">
                  Positron
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="satellite" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">
                  {dict.layers.satellite}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Properties Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost" 
                size="icon"
                onClick={() => setSettings(prev => ({ ...prev, showProperties: !prev.showProperties }))}
                className="size-10 bg-glass backdrop-blur-md rounded-full shadow-lg border border-glass-border flex items-center justify-center transition-all hover:bg-glass/80 text-foreground cursor-pointer"
              >
                <MapPin className={`size-5 ${settings.showProperties ? 'text-active-icon' : 'text-muted-foreground'}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="font-bold uppercase tracking-widest text-[10px]">
              {dict.layers.properties}
            </TooltipContent>
          </Tooltip>

          {/* Building Layouts Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost" 
                size="icon"
                onClick={() => setSettings(prev => ({ ...prev, showBuildingLayouts: !prev.showBuildingLayouts }))}
                className="size-10 bg-glass backdrop-blur-md rounded-full shadow-lg border border-glass-border flex items-center justify-center transition-all hover:bg-glass/80 text-foreground cursor-pointer"
              >
                <LayoutDashboard className={`size-5 ${settings.showBuildingLayouts ? 'text-active-icon' : 'text-muted-foreground'}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="font-bold uppercase tracking-widest text-[10px]">
              {dict.layers.buildingLayouts}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
