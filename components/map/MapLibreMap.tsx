"use client"

import { useEffect, useMemo, useRef } from "react"
import Map, {
  Source,
  Layer,
  MapRef,
  MapLayerMouseEvent,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
} from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { Layers, MapPin, LayoutDashboard, Target } from "lucide-react"
import { Button } from "../ui/button"
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
import { useLocalStorage } from "../../hooks/use-local-storage"
import { MapProps, Property } from "./types"

export type MapTheme = "liberty" | "bright" | "positron" | "satellite" | "osm"
export const MAP_THEME: MapTheme = "liberty"

const OSM_STYLE = {
  version: 8,
  sources: {
    "osm-raster": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: "osm-layer",
      type: "raster",
      source: "osm-raster",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
}

const SATELLITE_STYLE = {
  version: 8,
  sources: {
    "arcgis-satellite": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution:
        "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    },
  },
  layers: [
    {
      id: "satellite-layer",
      type: "raster",
      source: "arcgis-satellite",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
}

// Mute MapLibre's persistent "Image could not be loaded" warnings
if (typeof window !== "undefined") {
  const originalWarn = console.warn
  const originalError = console.error
  const filter = (args: unknown[]) =>
    args[0] &&
    typeof args[0] === "string" &&
    args[0].includes("Image") &&
    args[0].includes("could not be loaded")

  console.warn = (...args: unknown[]) => {
    if (filter(args)) return
    originalWarn(...args)
  }
  console.error = (...args: unknown[]) => {
    if (filter(args)) return
    originalError(...args)
  }
}

interface MapSettings {
  showProperties: boolean
  showBuildingLayouts: boolean
  clusteringEnabled: boolean
  mapTheme: MapTheme
}

const DEFAULT_SETTINGS: MapSettings = {
  showProperties: true,
  showBuildingLayouts: false,
  clusteringEnabled: true,
  mapTheme: MAP_THEME,
}

const THEME_COLORS: Record<MapTheme, string> = {
  liberty: "#5D60BE",
  bright: "#1a73e8",
  positron: "#333333",
  satellite: "#0ea5e9", // Vibrant Sky Blue for satellite
  osm: "#ff5722", // Vibrant Orange for OSM
}

const pendingPins = new globalThis.Map<string, Promise<HTMLImageElement>>()

const generatePinIcon = (color: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const svg = `
      <svg width="27" height="41" viewBox="0 0 27 41" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="shadowGradient">
            <stop offset="10%" stop-opacity="0.4"></stop>
            <stop offset="100%" stop-opacity="0.05"></stop>
          </radialGradient>
        </defs>
        <ellipse cx="13.5" cy="34.8" rx="10.5" ry="5.25" fill="url(#shadowGradient)"></ellipse>
        <path fill="${color}" d="M27,13.5C27,19.07 20.25,27 14.75,34.5C14.02,35.5 12.98,35.5 12.25,34.5C6.75,27 0,19.22 0,13.5C0,6.04 6.04,0 13.5,0C20.96,0 27,6.04 27,13.5Z"></path>
        <path opacity="0.25" d="M13.5,0C6.04,0 0,6.04 0,13.5C0,19.22 6.75,27 12.25,34.5C13,35.52 14.02,35.5 14.75,34.5C20.25,27 27,19.07 27,13.5C27,6.04 20.96,0 13.5,0ZM13.5,1C20.42,1 26,6.58 26,13.5C26,15.9 24.5,19.18 22.22,22.74C19.95,26.3 16.71,30.14 13.94,33.91C13.74,34.18 13.61,34.32 13.5,34.44C13.39,34.32 13.26,34.18 13.06,33.91C10.28,30.13 7.41,26.31 5.02,22.77C2.62,19.23 1,15.95 1,13.5C1,6.58 6.58,1 13.5,1Z"></path>
        <circle fill="white" cx="13.5" cy="13.5" r="5.5"></circle>
      </svg>
    `

    const img = new Image()
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })
}

export default function MapLibreMap({
  properties,
  onSelect,
  selectedProperty,
  onHover,
  dict,
}: MapProps) {
  const mapRef = useRef<MapRef>(null)
  const [settings, setSettings] = useLocalStorage<MapSettings>(
    "fidp-map-settings",
    DEFAULT_SETTINGS
  )

  const initialViewState = {
    longitude: 6.1432,
    latitude: 46.2044,
    zoom: 13,
  }

  // Center on selected property
  useEffect(() => {
    if (selectedProperty?.lat && selectedProperty?.lng && mapRef.current) {
      // The new sidebars are on the left (400px) and right (450px).
      // We use padding to tell MapLibre - but we must ensure we use the direct map instance
      const map = mapRef.current.getMap()
      map.flyTo({
        center: [selectedProperty.lng, selectedProperty.lat],
        zoom: 18,
        padding: { left: 400, right: 450, top: 0, bottom: 0 },
        essential: true,
        duration: 1000,
      })
    }
  }, [selectedProperty?.id, selectedProperty?.lat, selectedProperty?.lng])

  const geojsonData = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: properties
        .filter((p) => p.geometry)
        .map((p) => {
          try {
            const geometry = JSON.parse(p.geometry!)
            return {
              type: "Feature" as const,
              id: p.id,
              geometry,
              properties: { id: p.id },
            }
          } catch {
            return null
          }
        })
        .filter((f): f is NonNullable<typeof f> => f !== null),
    }),
    [properties]
  )

  const pointGeojsonData = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: properties
        .filter((p) => p.lat && p.lng)
        .map((p) => ({
          type: "Feature" as const,
          id: p.id,
          geometry: { type: "Point" as const, coordinates: [p.lng!, p.lat!] },
          properties: { id: p.id }, // Only keep ID to prevent stringification issues
        })),
    }),
    [properties]
  )

  const onMapClick = async (e: MapLayerMouseEvent) => {
    const cluster = e.features?.find(
      (f) =>
        f.layer.id === "cluster-outer" ||
        f.layer.id === "clusters" ||
        f.layer.id === "cluster-count" ||
        f.layer.id === "cluster-shadow" ||
        f.layer.id === "cluster-glow"
    )
    if (cluster) {
      const clusterId = cluster.properties?.cluster_id
      const pointCount = cluster.properties?.point_count
      const map = mapRef.current?.getMap()
      const source = (map?.getSource("properties-points-clustered") ||
        map?.getSource(
          "properties-points-unclustered"
        )) as maplibregl.GeoJSONSource

      if (!source) return

      try {
        const features = await source.getClusterLeaves(clusterId, pointCount, 0)

        if (!features || !features.length) {
          throw new Error("No features")
        }

        let minLng = 180,
          maxLng = -180,
          minLat = 90,
          maxLat = -90
        for (const f of features) {
          const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates
          if (lng < minLng) minLng = lng
          if (lng > maxLng) maxLng = lng
          if (lat < minLat) minLat = lat
          if (lat > maxLat) maxLat = lat
        }

        if (minLng === maxLng && minLat === maxLat) {
          map?.flyTo({
            center: [minLng, minLat],
            zoom: 18,
            padding: { left: 420, right: 470, top: 50, bottom: 50 },
            essential: true,
          })
        } else {
          map?.fitBounds(
            [
              [minLng, minLat],
              [maxLng, maxLat],
            ],
            {
              padding: { left: 450, right: 500, top: 100, bottom: 100 },
              maxZoom: 18,
              duration: 1000,
            }
          )
        }
      } catch {
        // Fallback to basic expansion zoom
        try {
          const zoom = await source.getClusterExpansionZoom(clusterId)
          map?.flyTo({
            center: (cluster.geometry as GeoJSON.Point).coordinates,
            zoom: zoom + 1,
            padding: { left: 400, right: 450, top: 100, bottom: 100 },
            essential: true,
          })
        } catch (err2) {
          console.error("Failed to zoom to cluster", err2)
        }
      }
      return // Don't process other clicks
    }

    const pin = e.features?.find((f) => f.layer.id === "unclustered-point")
    if (pin) {
      const propertyId = pin.properties?.id
      const property = properties.find((p) => p.id === propertyId)
      if (property) {
        onSelect(property)
      }
      return // Don't process other clicks
    }

    // Clear selection if clicking empty space
    // We check if it's the actual map canvas to avoid clearing when clicking controls
    if (e.target.getCanvas().contains(e.originalEvent.target as Node)) {
      onSelect(null as unknown as Property)
    }
  }

  const onMouseEnter = (e: MapLayerMouseEvent) => {
    if (mapRef.current) {
      mapRef.current.getMap().getCanvas().style.cursor = "pointer"
    }

    const pin = e.features?.find((f) => f.layer.id === "unclustered-point")
    if (pin && onHover) {
      const propertyId = pin.properties?.id
      const property = properties.find((p) => p.id === propertyId)
      if (property) {
        onHover(property)
      }
    }
  }

  const onMouseLeave = () => {
    if (mapRef.current) {
      mapRef.current.getMap().getCanvas().style.cursor = ""
    }
  }

  const isClusteringEnabled = settings.clusteringEnabled ?? true

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Offset MapLibre controls to clear the 400px sidebar, but only when not in fullscreen */}
      <style>{`
        .maplibregl-ctrl-top-left,
        .maplibregl-ctrl-bottom-left {
          left: 410px !important;
          transition: left 0.3s ease-in-out;
        }
        .maplibregl-ctrl-top-left {
          top: 10px !important;
        }
        .maplibregl-ctrl-bottom-left {
          bottom: 10px !important;
        }

        /* Reset offsets when the map container is in fullscreen mode */
        .maplibregl-canvas-container:fullscreen .maplibregl-ctrl-top-left,
        .maplibregl-canvas-container:fullscreen .maplibregl-ctrl-bottom-left,
        .maplibregl-map:fullscreen .maplibregl-ctrl-top-left,
        .maplibregl-map:fullscreen .maplibregl-ctrl-bottom-left {
          left: 10px !important;
        }
      `}</style>
      <div className="h-full w-full">
        <Map
          ref={mapRef}
          initialViewState={initialViewState}
          style={{ width: "100%", height: "100%" }}
          interactiveLayerIds={["clusters", "unclustered-point"]}
          mapStyle={
            settings.mapTheme === "satellite"
              ? (SATELLITE_STYLE as maplibregl.StyleSpecification)
              : settings.mapTheme === "osm"
                ? (OSM_STYLE as maplibregl.StyleSpecification)
                : `https://tiles.openfreemap.org/styles/${settings.mapTheme || MAP_THEME}`
          }
          onClick={onMapClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          maxZoom={
            settings.mapTheme === "osm" || settings.mapTheme === "satellite"
              ? 18
              : 22
          }
          onLoad={(e) => {
            e.target.on("styleimagemissing", async (ev: { id: string }) => {
              const id = ev.id
              if (id.startsWith("pin-")) {
                if (e.target.hasImage(id)) return

                const theme = id.replace("pin-", "")
                let color = "#000000" // Default / selected
                if (theme === "satellite") color = "#0ea5e9"
                else if (THEME_COLORS[theme as MapTheme])
                  color = THEME_COLORS[theme as MapTheme]

                try {
                  let imgPromise = pendingPins.get(id)
                  if (!imgPromise) {
                    imgPromise = generatePinIcon(color)
                    pendingPins.set(id, imgPromise)
                  }

                  const img = await imgPromise

                  if (!e.target.hasImage(id)) {
                    e.target.addImage(id, img)
                  }
                } catch (err) {
                  console.error(`Failed to generate pin icon for ${id}:`, err)
                } finally {
                  pendingPins.delete(id)
                }
              } else if (!e.target.hasImage(id)) {
                e.target.addImage(id, {
                  width: 1,
                  height: 1,
                  data: new Uint8Array([0, 0, 0, 0]),
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any)
              }
            })
          }}
        >
          <GeolocateControl position="top-left" />
          <FullscreenControl position="top-left" />
          <NavigationControl position="top-left" />
          <ScaleControl />
          {/* Inject Building Numbers Layer - only if not in satellite mode */}
          {settings.mapTheme !== "satellite" && (
            <Layer
              id="house-numbers"
              type="symbol"
              source="openmaptiles"
              source-layer="housenumber"
              minzoom={17}
              layout={{
                "text-field": "{housenumber}",
                "text-font": ["Noto Sans Regular"],
                "text-size": 10,
                "text-padding": 1,
              }}
              paint={{
                "text-color": "rgba(0, 0, 0, 0.6)",
                "text-halo-color": "rgba(255, 255, 255, 0.8)",
                "text-halo-width": 1,
              }}
            />
          )}

          {/* Render clustered points when showProperties is true. Legacy markers were removed for performance. */}
          {settings.showProperties && (
            <Source
              id={
                isClusteringEnabled
                  ? "properties-points-clustered"
                  : "properties-points-unclustered"
              }
              key={
                isClusteringEnabled
                  ? "properties-points-clustered"
                  : "properties-points-unclustered"
              }
              type="geojson"
              data={pointGeojsonData}
              cluster={isClusteringEnabled}
              clusterMaxZoom={14}
              clusterRadius={125}
            >
              {/* Cluster Shadow */}
              <Layer
                id="cluster-shadow"
                type="circle"
                filter={["has", "point_count"]}
                paint={{
                  "circle-color": "#000000",
                  "circle-opacity": 0.4,
                  "circle-blur": 0.5,
                  "circle-translate": [0, 4],
                  "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    28,
                    10,
                    32,
                    50,
                    36,
                  ],
                }}
              />
              {/* Cluster Outer Ring */}
              <Layer
                id="cluster-outer"
                type="circle"
                filter={["has", "point_count"]}
                paint={{
                  "circle-color":
                    settings.mapTheme === "satellite"
                      ? "#0ea5e9"
                      : THEME_COLORS[settings.mapTheme || MAP_THEME],
                  "circle-opacity": 0.25,
                  "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    28,
                    10,
                    32,
                    50,
                    36,
                  ],
                }}
              />
              {/* Cluster Inner Glow */}
              <Layer
                id="cluster-glow"
                type="circle"
                filter={["has", "point_count"]}
                paint={{
                  "circle-color":
                    settings.mapTheme === "satellite"
                      ? "#0ea5e9"
                      : THEME_COLORS[settings.mapTheme || MAP_THEME],
                  "circle-opacity": 0.6,
                  "circle-blur": 0.8,
                  "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    24,
                    10,
                    28,
                    50,
                    32,
                  ],
                }}
              />
              {/* Cluster Inner Core */}
              <Layer
                id="clusters"
                type="circle"
                filter={["has", "point_count"]}
                paint={{
                  "circle-color":
                    settings.mapTheme === "satellite"
                      ? "#0ea5e9"
                      : THEME_COLORS[settings.mapTheme || MAP_THEME],
                  "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    18,
                    10,
                    22,
                    50,
                    26,
                  ],
                }}
              />
              <Layer
                id="cluster-count"
                type="symbol"
                filter={["has", "point_count"]}
                layout={{
                  "text-field": "{point_count_abbreviated}",
                  "text-font": ["Noto Sans Regular"],
                  "text-size": 12,
                }}
                paint={{
                  "text-color": "#ffffff",
                }}
              />
              <Layer
                id="unclustered-point"
                type="symbol"
                filter={["!", ["has", "point_count"]]}
                layout={{
                  "icon-image": [
                    "case",
                    ["==", ["get", "id"], selectedProperty?.id || -1],
                    "pin-selected",
                    `pin-${settings.mapTheme || MAP_THEME}`,
                  ],
                  "icon-size": [
                    "case",
                    ["==", ["get", "id"], selectedProperty?.id || -1],
                    1.25,
                    1,
                  ],
                  "icon-allow-overlap": true,
                  "icon-anchor": "bottom",
                }}
              />
            </Source>
          )}

          {settings.showBuildingLayouts && (
            <Source type="geojson" data={geojsonData}>
              <Layer
                id="building-layouts"
                type="fill"
                minzoom={16}
                paint={{
                  "fill-color": "#000",
                  "fill-opacity": [
                    "case",
                    ["==", ["get", "id"], selectedProperty?.id || -1],
                    0.3,
                    0.1,
                  ],
                }}
              />
              <Layer
                id="building-borders"
                type="line"
                minzoom={16}
                paint={{
                  "line-color": "#000",
                  "line-width": [
                    "case",
                    ["==", ["get", "id"], selectedProperty?.id || -1],
                    3,
                    1,
                  ],
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
          transform: selectedProperty
            ? "translateX(calc(-450px - 1rem))"
            : "translateX(0)",
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
                    className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-glass-border bg-glass text-foreground shadow-lg backdrop-blur-md transition-all hover:bg-glass/80"
                  >
                    <Layers
                      className={`size-5 ${settings.mapTheme !== "positron" ? "text-active-icon" : "text-foreground"}`}
                    />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                className="text-[10px] font-bold tracking-widest uppercase"
              >
                {dict.layers.style}
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent
              side="left"
              align="start"
              sideOffset={12}
              className="rounded-xl border-glass-border bg-glass shadow-2xl backdrop-blur-xl"
            >
              <DropdownMenuRadioGroup
                value={settings.mapTheme || MAP_THEME}
                onValueChange={(val) =>
                  setSettings((prev) => ({
                    ...prev,
                    mapTheme: val as MapTheme,
                  }))
                }
              >
                <DropdownMenuRadioItem
                  value="liberty"
                  className="cursor-pointer text-[10px] font-black tracking-widest uppercase"
                >
                  Liberty
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="bright"
                  className="cursor-pointer text-[10px] font-black tracking-widest uppercase"
                >
                  Bright
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="positron"
                  className="cursor-pointer text-[10px] font-black tracking-widest uppercase"
                >
                  Positron
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="osm"
                  className="cursor-pointer text-[10px] font-black tracking-widest uppercase"
                >
                  OSM
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="satellite"
                  className="cursor-pointer text-[10px] font-black tracking-widest uppercase"
                >
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
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    showProperties: !prev.showProperties,
                  }))
                }
                className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-glass-border bg-glass text-foreground shadow-lg backdrop-blur-md transition-all hover:bg-glass/80"
              >
                <MapPin
                  className={`size-5 ${settings.showProperties ? "text-active-icon" : "text-muted-foreground"}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="text-[10px] font-bold tracking-widest uppercase"
            >
              {dict.layers.properties}
            </TooltipContent>
          </Tooltip>

          {/* Building Layouts Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    showBuildingLayouts: !prev.showBuildingLayouts,
                  }))
                }
                className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-glass-border bg-glass text-foreground shadow-lg backdrop-blur-md transition-all hover:bg-glass/80"
              >
                <LayoutDashboard
                  className={`size-5 ${settings.showBuildingLayouts ? "text-active-icon" : "text-muted-foreground"}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="text-[10px] font-bold tracking-widest uppercase"
            >
              {dict.layers.buildingLayouts}
            </TooltipContent>
          </Tooltip>

          {/* Clustering Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    clusteringEnabled: !prev.clusteringEnabled,
                  }))
                }
                className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-glass-border bg-glass text-foreground shadow-lg backdrop-blur-md transition-all hover:bg-glass/80"
              >
                <Target
                  className={`size-5 ${settings.clusteringEnabled ? "text-active-icon" : "text-muted-foreground"}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="text-[10px] font-bold tracking-widest uppercase"
            >
              {dict.dashboard?.clustering || "CLUSTERING"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
