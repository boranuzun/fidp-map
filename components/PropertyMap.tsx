'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface Property {
  id: number;
  name?: string | null;
  fondation?: string | null;
  localite?: string | null;
  address: string;
  units?: number | null;
  group?: string | null;
  tags?: string | null;
  url: string;
  lat?: number | null;
  lng?: number | null;
  geometry?: string | null;
  image_url?: string | null;
  scraped_at: string;
}

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
function MapViewHandler({ center }: { center: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
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
  }, [center, map]);

  return null;
}

export default function PropertyMap({ 
  properties, 
  onSelect, 
  selectedProperty 
}: { 
  properties: Property[], 
  onSelect: (p: Property) => void,
  selectedProperty: Property | null
}) {
  const centerPosition = selectedProperty?.lat && selectedProperty?.lng 
    ? [selectedProperty.lat, selectedProperty.lng] as [number, number]
    : null;

  return (
    <div className="h-full w-full">
      <MapContainer 
        center={[46.2044, 6.1432]} 
        zoom={13} 
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          className="grayscale brightness-95 contrast-105"
        />
        
        <MapViewHandler center={centerPosition} />

        {properties.filter(p => p.lat && p.lng).map((p) => {
          const isSelected = selectedProperty?.id === p.id;
          return (
            <Marker 
              key={`${p.id}-${isSelected ? 'selected' : 'default'}`} 
              position={[p.lat!, p.lng!]}
              icon={isSelected ? SelectedIcon : DefaultIcon}
              zIndexOffset={isSelected ? 1000 : 0}
              eventHandlers={{ 
                click: () => onSelect(p)
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
