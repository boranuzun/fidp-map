'use client';

import dynamic from 'next/dynamic';
import { MAP_ENGINE } from '../lib/map-config';
import { MapProps } from './map/types';

// Export types so they can be used by consumers
export type { Property } from './map/types';

// Dynamically import the chosen map engine to optimize bundle size
const LeafletMap = dynamic(() => import('./map/LeafletMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse" />
});

const MapLibreMap = dynamic(() => import('./map/MapLibreMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse" />
});

export default function PropertyMap(props: MapProps) {
  if (MAP_ENGINE === 'maplibre') {
    return <MapLibreMap {...props} />;
  }
  
  return <LeafletMap {...props} />;
}
