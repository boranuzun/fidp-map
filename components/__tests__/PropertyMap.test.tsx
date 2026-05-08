import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import React from 'react';
// Mock next/dynamic to render synchronously in tests
vi.mock('next/dynamic', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: vi.fn((loader: any) => {
    const Component = React.lazy(loader);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DynamicComponent = (props: any) => (
      <React.Suspense fallback={<div data-testid="loading" />}>
        <Component {...props} />
      </React.Suspense>
    );
    return DynamicComponent;
  }),
}));

// Mock the MapLibreMap component directly
vi.mock('../map/MapLibreMap', () => ({
  default: () => <div data-testid="maplibre-map" />
}));

import PropertyMap from '../PropertyMap';

describe('PropertyMap', () => {
  const mockDict = {
    layers: {
      grayscale: 'Grayscale',
      color: 'Color',
      properties: 'Properties',
      buildingLayouts: 'Building Layouts',
    }
  };

  it('renders the maplibre map engine', async () => {
    render(
      <PropertyMap 
        properties={[]} 
        onSelect={() => {}} 
        selectedProperty={null} 
        dict={mockDict}
      />
    );
    
    expect(await screen.findByTestId('maplibre-map')).toBeInTheDocument();
  });
});
