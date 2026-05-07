import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import React from 'react';
// Mock next/dynamic to render synchronously in tests
vi.mock('next/dynamic', () => ({
  default: vi.fn((loader: () => Promise<{ default: React.ComponentType<unknown> }>) => {
    // This is a synchronous version for tests
    const Component = React.lazy(loader);
    const DynamicComponent = (props: unknown) => (
      <React.Suspense fallback={null}>
        <Component {...props} />
      </React.Suspense>
    );
    DynamicComponent.displayName = 'DynamicComponent';
    return DynamicComponent;
  }),
}));

// Mock maplibre-gl and react-map-gl/maplibre
vi.mock('react-map-gl/maplibre', () => {
  const MapMock = ({ children }: { children: React.ReactNode }) => <div data-testid="maplibre-map">{children}</div>;
  MapMock.displayName = 'MapMock';
  return {
    default: MapMock,
    Marker: () => <div data-testid="maplibre-marker" />,
    Source: ({ children }: { children: React.ReactNode }) => <div data-testid="maplibre-source">{children}</div>,
    Layer: () => <div data-testid="maplibre-layer" />,
  };
});

// Mock Leaflet
vi.mock("react-leaflet", () => {
  const LayersControlMock = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layers-control">{children}</div>
  );
  const BaseLayerMock = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="base-layer">{children}</div>
  );
  BaseLayerMock.displayName = 'BaseLayerMock';
  LayersControlMock.BaseLayer = BaseLayerMock;

  const OverlayMock = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="overlay">{children}</div>
  );
  OverlayMock.displayName = 'OverlayMock';
  LayersControlMock.Overlay = OverlayMock;

  return {
    MapContainer: ({ children }: { children: React.ReactNode }) => {
      const MapContainerMock = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="map-container">{children}</div>
      );
      MapContainerMock.displayName = 'MapContainerMock';
      return <MapContainerMock>{children}</MapContainerMock>;
    },
    TileLayer: () => {
      const TileLayerMock = () => <div />;
      TileLayerMock.displayName = 'TileLayerMock';
      return <TileLayerMock />;
    },
    Marker: () => {
      const MarkerMock = () => <div />;
      MarkerMock.displayName = 'MarkerMock';
      return <MarkerMock />;
    },
    useMap: () => ({ setView: vi.fn(), project: vi.fn(), unproject: vi.fn() }),
    LayersControl: LayersControlMock,
    useMapEvents: vi.fn(),
    Polygon: () => {
      const PolygonMock = () => <div />;
      PolygonMock.displayName = 'PolygonMock';
      return <PolygonMock />;
    },
    LayerGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="layer-group">{children}</div>,
  };
});

import PropertyMap from '../PropertyMap';
import { MAP_ENGINE } from '../../lib/map-config';

describe('PropertyMap', () => {
  const mockDict = {
    layers: {
      grayscale: 'Grayscale',
      color: 'Color',
      properties: 'Properties',
      buildingLayouts: 'Building Layouts',
    }
  };

  it('renders the correct map engine based on config', async () => {
    render(
      <PropertyMap 
        properties={[]} 
        onSelect={() => {}} 
        selectedProperty={null} 
        dict={mockDict}
      />
    );
    
    if (MAP_ENGINE === 'maplibre') {
      expect(await screen.findByTestId('maplibre-map')).toBeInTheDocument();
    } else {
      expect(await screen.findByTestId('layers-control')).toBeInTheDocument();
      expect(await screen.findAllByTestId('base-layer')).toHaveLength(2);
      expect(await screen.findAllByTestId('overlay')).toHaveLength(2);
    }
  });
});
