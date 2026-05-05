import { render, screen, fireEvent } from '@testing-library/react';
import PropertyMap from '../PropertyMap';
import { vi, describe, it, expect } from 'vitest';

// Mock Leaflet as it doesn't work in JSDOM
vi.mock("react-leaflet", () => {
  const LayersControlMock = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layers-control">{children}</div>
  );
  LayersControlMock.BaseLayer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="base-layer">{children}</div>
  );
  LayersControlMock.Overlay = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="overlay">{children}</div>
  );

  return {
    MapContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="map-container">{children}</div>
    ),
    TileLayer: () => <div />,
    Marker: () => <div />,
    useMap: () => ({ setView: vi.fn(), project: vi.fn(), unproject: vi.fn() }),
    LayersControl: LayersControlMock,
    useMapEvents: vi.fn(),
    Polygon: () => <div />,
    LayerGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="layer-group">{children}</div>,
  };
});

describe('PropertyMap', () => {
  it('renders LayersControl with base layers and overlays', () => {
    render(
      <PropertyMap 
        properties={[]} 
        onSelect={() => {}} 
        selectedProperty={null} 
      />
    );
    
    expect(screen.getByTestId('layers-control')).toBeInTheDocument();
    expect(screen.getAllByTestId('base-layer')).toHaveLength(2);
    expect(screen.getAllByTestId('overlay')).toHaveLength(2);
    expect(screen.getAllByTestId('layer-group')).toHaveLength(2);
  });
});
