'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, LayersControl, useMapEvents, Polygon, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocalStorage } from '../hooks/use-local-storage';

export interface Property {
  id: number;
  name?: string | null;
  fondation?: string | null;
  localite?: string | null;
  zip?: string | null;
  address: string;
  units?: number | null;
  group?: string | null;
  tags?: string[] | null;
  url: string;
  lat?: number | null;
  lng?: number | null;
  geometry?: string | null;
  images?: string[] | null;
  construction_year?: number | null;
  scraped_at: string;
}

interface MapSettings {
  baseLayer: 'Grayscale' | 'Color';
  showProperties: boolean;
  showBuildingLayouts: boolean;
}

const DEFAULT_SETTINGS: MapSettings = {
  baseLayer: 'Grayscale',
  showProperties: true,
  showBuildingLayouts: false,
};

// Fix Leaflet's default icon path issues in Next.js
const createCustomIcon = (isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="w-8 h-8 flex items-center justify-center border-2 border-black transition-all ${isSelected ? 'bg-black text-white scale-125' : 'bg-white text-black'}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v18Z"/><path d="M6 18h14"/><path d="M6 14h14"/><path d="M6 10h14"/></svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const DefaultIcon = createCustomIcon(false);
const SelectedIcon = createCustomIcon(true);

// Component to handle map view changes with offset for the side drawer
function MapViewHandler({ 
  center, 
  propertyId 
}: { 
  center: [number, number] | null;
  propertyId: number | null;
}) {
  const map = useMap();
  const lastIdRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (center && propertyId !== lastIdRef.current) {
      lastIdRef.current = propertyId;
      
      // Calculate offset: The sheet is roughly 440px wide (max-w-md).
      // We want to shift the map center so the pin appears in the middle of the REMAINING space.
      // 440px / 2 = 220px
      const zoom = 18;
      const point = map.project(center, zoom);
      const shiftedPoint = L.point(point.x + 220, point.y);
      const shiftedCenter = map.unproject(shiftedPoint, zoom);

      map.setView(shiftedCenter, zoom, {
        animate: true,
        duration: 0.5
      });
    }
  }, [center, propertyId, map]);

  return null;
}

const parseGeometry = (geometryStr?: string | null): [number, number][] | null => {
  if (!geometryStr) return null;
  try {
    const geo = JSON.parse(geometryStr);
    if (geo.type === 'Polygon' && Array.isArray(geo.coordinates)) {
      // Leaflet's Polygon component expects [lat, lon] order.
      // GeoJSON standard (your data) is [lon, lat]. We must swap them for Leaflet.
      return geo.coordinates[0].map(([lon, lat]) => [lat, lon]) as [number, number][];
    }
  } catch (e) {
    console.error("Failed to parse geometry", e);
  }
  return null;
};

// Component to handle zoom and base layer changes
function MapSettingsHandler({ 
  setZoom, 
  setSettings 
}: { 
  setZoom: (z: number) => void; 
  setSettings: (s: (prev: MapSettings) => MapSettings) => void;
}) {
  const map = useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    },
    baselayerchange: (e) => {
      setSettings(prev => ({ ...prev, baseLayer: e.name as 'Grayscale' | 'Color' }));
    },
    overlayadd: (e) => {
      if (e.name === 'Properties') setSettings(prev => ({ ...prev, showProperties: true }));
      if (e.name === 'Building Layouts') setSettings(prev => ({ ...prev, showBuildingLayouts: true }));
    },
    overlayremove: (e) => {
      if (e.name === 'Properties') setSettings(prev => ({ ...prev, showProperties: false }));
      if (e.name === 'Building Layouts') setSettings(prev => ({ ...prev, showBuildingLayouts: false }));
    }
  });
  return null;
}

export default function PropertyMap({ 
  properties, 
  onSelect, 
  selectedProperty,
  onHover
}: { 
  properties: Property[], 
  onSelect: (p: Property) => void,
  selectedProperty: Property | null,
  onHover?: (p: Property) => void
}) {
  const [zoom, setZoom] = useState(13);
  const [settings, setSettings] = useLocalStorage<MapSettings>('fidp-map-settings', DEFAULT_SETTINGS);

  const centerPosition = useMemo(() => 
    selectedProperty?.lat && selectedProperty?.lng 
      ? [selectedProperty.lat, selectedProperty.lng] as [number, number]
      : null,
    [selectedProperty?.id, selectedProperty?.lat, selectedProperty?.lng]
  );

  return (
    <div className="relative h-full w-full">
      <div className={`h-full w-full transition-all duration-500 ${settings.baseLayer === 'Grayscale' ? 'grayscale brightness-95 contrast-105' : ''}`}>
        <MapContainer 
          center={[46.2044, 6.1432]} 
          zoom={13} 
          maxZoom={20}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked={settings.baseLayer === 'Grayscale'} name="Grayscale">
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxNativeZoom={19}
                maxZoom={20}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked={settings.baseLayer === 'Color'} name="Color">
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxNativeZoom={19}
                maxZoom={20}
              />
            </LayersControl.BaseLayer>

            <LayersControl.Overlay checked={settings.showProperties} name="Properties">
              <LayerGroup>
                {properties.filter(p => p.lat && p.lng).map((p) => {
                  const isSelected = selectedProperty?.id === p.id;
                  return (
                    <Marker 
                      key={`${p.id}-${isSelected ? 'selected' : 'default'}`} 
                      position={[p.lat!, p.lng!]}
                      icon={isSelected ? SelectedIcon : DefaultIcon}
                      zIndexOffset={isSelected ? 1000 : 0}
                      eventHandlers={{ 
                        click: () => onSelect(p),
                        mouseover: () => onHover?.(p)
                      }}
                    />
                  );
                })}
              </LayerGroup>
            </LayersControl.Overlay>

            <LayersControl.Overlay checked={settings.showBuildingLayouts} name="Building Layouts">
              <LayerGroup>
                {zoom >= 17 && properties.map(p => {
                  const coords = parseGeometry(p.geometry);
                  if (!coords) return null;
                  const isSelected = selectedProperty?.id === p.id;
                  return (
                    <Polygon
                      key={`poly-${p.id}`}
                      positions={coords}
                      pathOptions={{
                        color: '#000000',
                        weight: isSelected ? 3 : 1,
                        fillColor: '#000000',
                        fillOpacity: isSelected ? 0.3 : 0.1,
                      }}
                      eventHandlers={{
                        click: () => onSelect(p),
                      }}
                    />
                  );
                })}
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>
          
          <MapSettingsHandler setZoom={setZoom} setSettings={setSettings} />
          <MapViewHandler center={centerPosition} propertyId={selectedProperty?.id ?? null} />
        </MapContainer>
      </div>
    </div>
  );
}

