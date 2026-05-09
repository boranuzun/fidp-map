/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import MapLibreMap from "../MapLibreMap"
import { MapRef, MapLayerMouseEvent } from "react-map-gl/maplibre"

const mockFlyTo = vi.fn()
const mockGetSource = vi.fn()
const mockCanvas = { style: { cursor: "" }, contains: vi.fn(() => true) }
const mockGetCanvas = vi.fn(() => mockCanvas)

let testFeatures: any[] = []
export const setTestFeatures = (features: any[]) => {
  testFeatures = features
}

const mockMapContext = {
  getMap: () => ({
    getSource: mockGetSource,
    getCanvas: mockGetCanvas,
    flyTo: mockFlyTo,
  }),
  flyTo: mockFlyTo,
}

// Mock react-map-gl components
vi.mock("react-map-gl/maplibre", async () => {
  const actual = await vi.importActual("react-map-gl/maplibre")
  return {
    ...actual,
    default: ({
      children,
      onClick,
      onMouseEnter,
      onMouseLeave,
      interactiveLayerIds,
      ...props
    }: any) => {
      // We pass MapRef to the ref passed from MapLibreMap
      if (props.ref) {
        if (typeof props.ref === "function") {
          props.ref(mockMapContext as unknown as MapRef)
        } else {
          props.ref.current = mockMapContext as unknown as MapRef
        }
      }
      return (
        <div
          data-testid="mock-map"
          onClick={() => {
            if (onClick) {
              const customEvent = {
                features: testFeatures,
                target: { getCanvas: mockGetCanvas },
                originalEvent: { target: document.createElement("div") },
              } as unknown as MapLayerMouseEvent
              onClick(customEvent)
            }
          }}
          onMouseEnter={() => {
            if (onMouseEnter) {
              const customEvent = {
                features: testFeatures,
                target: { getCanvas: mockGetCanvas },
              } as unknown as MapLayerMouseEvent
              onMouseEnter(customEvent)
            }
          }}
          onMouseLeave={() => {
            if (onMouseLeave) {
              const customEvent = {
                features: [],
                target: { getCanvas: mockGetCanvas },
              } as unknown as MapLayerMouseEvent
              onMouseLeave(customEvent)
            }
          }}
        >
          <div data-interactive-layers={JSON.stringify(interactiveLayerIds)} />
          {children}
        </div>
      )
    },
    Source: ({ children, id }: any) => (
      <div data-testid={`mock-source-${id}`}>{children}</div>
    ),
    Layer: ({
      id,
      type,
      paint,
      layout,
      filter,
      source,
      "source-layer": sourceLayer,
      minzoom,
    }: any) => (
      <div
        data-testid={`mock-layer-${id}`}
        type={type}
        paint={paint}
        layout={layout}
        filter={filter}
        source={source}
        source-layer={sourceLayer}
        minzoom={minzoom}
      />
    ),
    useMap: vi.fn(),
    GeolocateControl: () => <div data-testid="mock-geolocate-control" />,
    FullscreenControl: () => <div data-testid="mock-fullscreen-control" />,
    NavigationControl: () => <div data-testid="mock-navigation-control" />,
    ScaleControl: () => <div data-testid="mock-scale-control" />,
  }
})

const mockProperties = [
  {
    id: 1,
    address: "Test 1",
    lat: 46.2,
    lng: 6.1,
    geometry: '{"type":"Point","coordinates":[6.1,46.2]}',
  },
  {
    id: 2,
    address: "Test 2",
    lat: 46.3,
    lng: 6.2,
    geometry: '{"type":"Point","coordinates":[6.2,46.3]}',
  },
]

const mockDict = {
  layers: {
    style: "STYLE",
    grayscale: "GRAYSCALE",
    color: "COLOR",
    properties: "PROPERTIES",
    buildingLayouts: "LAYOUTS",
    satellite: "SATELLITE",
  },
}

describe("MapLibreMap", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders properties-points source and cluster layers", () => {
    render(
      <MapLibreMap
        properties={mockProperties}
        onSelect={vi.fn()}
        selectedProperty={null}
        dict={mockDict as any}
      />
    )

    // Should find the properties-points source
    expect(
      screen.getByTestId("mock-source-properties-points-clustered")
    ).toBeInTheDocument()

    // Should find the cluster layers
    expect(screen.getByTestId("mock-layer-clusters")).toBeInTheDocument()
    expect(screen.getByTestId("mock-layer-cluster-count")).toBeInTheDocument()
    expect(
      screen.getByTestId("mock-layer-unclustered-point")
    ).toBeInTheDocument()
  })

  it("handles clicking on a cluster to zoom in", async () => {
    render(
      <MapLibreMap
        properties={mockProperties}
        onSelect={vi.fn()}
        selectedProperty={null}
        dict={mockDict as any}
      />
    )

    mockGetSource.mockReturnValue({
      getClusterExpansionZoom: vi.fn().mockResolvedValue(16),
      getClusterLeaves: vi
        .fn()
        .mockRejectedValue(new Error("fallback to expansion zoom")),
    })

    const mapNode = screen.getByTestId("mock-map")

    // Simulate clicking on a cluster
    setTestFeatures([
      {
        layer: { id: "clusters" },
        properties: { cluster_id: 123, point_count: 5 },
        geometry: { coordinates: [6.1, 46.2] },
      },
    ])
    fireEvent.click(mapNode)

    await vi.waitFor(() => {
      expect(mockGetSource).toHaveBeenCalledWith("properties-points-clustered")
      expect(mockFlyTo).toHaveBeenCalledWith({
        center: [6.1, 46.2],
        zoom: 17,
        padding: { left: 400, right: 450, top: 100, bottom: 100 },
        essential: true,
      })
    })
  })

  it("handles clicking on a pin to select property", () => {
    const onSelect = vi.fn()
    render(
      <MapLibreMap
        properties={mockProperties}
        onSelect={onSelect}
        selectedProperty={null}
        dict={mockDict as any}
      />
    )

    const mapNode = screen.getByTestId("mock-map")

    // Simulate clicking on a pin
    setTestFeatures([
      { layer: { id: "unclustered-point" }, properties: { id: 1 } },
    ])
    fireEvent.click(mapNode)

    expect(onSelect).toHaveBeenCalledWith(mockProperties[0])
  })

  it("handles map background click to clear selection", () => {
    const onSelect = vi.fn()
    render(
      <MapLibreMap
        properties={mockProperties}
        onSelect={onSelect}
        selectedProperty={mockProperties[0]}
        dict={mockDict as any}
      />
    )

    const mapNode = screen.getByTestId("mock-map")

    // Simulate clicking on empty space (no features)
    setTestFeatures([])
    fireEvent.click(mapNode)

    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it("handles pin hover", () => {
    const onHover = vi.fn()
    render(
      <MapLibreMap
        properties={mockProperties}
        onSelect={vi.fn()}
        selectedProperty={null}
        onHover={onHover}
        dict={mockDict as any}
      />
    )

    const mapNode = screen.getByTestId("mock-map")

    // Simulate hover on pin
    setTestFeatures([
      { layer: { id: "unclustered-point" }, properties: { id: 1 } },
    ])
    fireEvent.mouseEnter(mapNode)

    expect(mockGetCanvas().style.cursor).toBe("pointer")
    expect(onHover).toHaveBeenCalledWith(mockProperties[0])

    // Simulate mouse leave
    fireEvent.mouseLeave(mapNode)
    expect(mockGetCanvas().style.cursor).toBe("")
  })
})
