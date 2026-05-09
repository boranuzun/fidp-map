"use client"

import dynamic from "next/dynamic"
import { MapProps } from "./map/types"

// Export types so they can be used by consumers
export type { Property } from "./map/types"

const MapLibreMap = dynamic(() => import("./map/MapLibreMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-gray-100" />,
})

export default function PropertyMap(props: MapProps) {
  return (
    <div className="h-full w-full">
      <MapLibreMap {...props} />
    </div>
  )
}
