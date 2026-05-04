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
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

const SelectedIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
  className: 'marker-selected'
});

// Component to handle map view changes with offset for the side drawer
function MapViewHandler({ center }: { center: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      // Calculate offset: The sheet is roughly 448px wide (max-w-md).
      // We want to shift the map center so the pin appears in the middle of the REMAINING space.
      // This means we shift the map's logical center to the right.
      const zoom = 18;
      const point = map.project(center, zoom);
      
      // Shift right by half the sheet width to keep pin centered in visible area
      // 448px / 2 = 224px
      const shiftedPoint = L.point(point.x + 224, point.y);
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
