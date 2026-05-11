"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import LanguageSwitcher from "./ui/language-switcher"
import { ModeToggle } from "./ui/mode-toggle"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel"
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog"
import { MultiSelectCombobox } from "./ui/multi-select-combobox"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import MapSidebar from "./map/MapSidebar"
import PropertyDetailsSidebar from "./map/PropertyDetailsSidebar"
import { type Property } from "./PropertyMap"
import { Building2, MapPin, Globe, Layers } from "lucide-react"
import logo from "../public/fidp-logo.webp"

const MapPlaceholder = () => {
  const params = useParams()
  const lang = params?.lang as string
  const loadingText =
    lang === "fr" ? "Chargement de la carte..." : "Loading Map..."

  return (
    <div className="flex h-full w-full animate-pulse items-center justify-center bg-muted text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
      {loadingText}
    </div>
  )
}

const PropertyMap = dynamic(() => import("./PropertyMap"), {
  ssr: false,
  loading: MapPlaceholder,
})

const prefetchImages = (images?: string[] | null) => {
  if (!images || images.length === 0) return
  images.forEach((url) => {
    const img = new globalThis.Image()
    img.src = url
  })
}

interface DashboardClientProps {
  initialProperties: Property[]
  dict: {
    common: {
      title: string
      about: string
      language: string
      french: string
      english: string
      german: string
      italian: string
    }
    dashboard: {
      allProperties: string
      unknownLocalite: string
      searchPlaceholder: string
      localites: string
      allLocalites: string
      fondations: string
      allFondations: string
      resetFilters: string
      filteredResults: string
      noMatch: string
      visitSite: string
      groupByLocalite: string
      propertiesCount: string
    }
    details: Record<string, string>
    map: {
      layers: {
        grayscale: string
        color: string
        properties: string
        buildingLayouts: string
      }
    }
  }
}

export default function DashboardClient({
  initialProperties,
  dict,
}: DashboardClientProps) {
  const params = useParams()
  const lang = params?.lang as string

  const allLocalites = useMemo(
    () =>
      Array.from(
        new Set(initialProperties.map((p) => p.localite).filter(Boolean))
      ) as string[],
    [initialProperties]
  )

  const allFondations = useMemo(
    () =>
      Array.from(
        new Set(initialProperties.map((p) => p.fondation).filter(Boolean))
      ) as string[],
    [initialProperties]
  )

  const [search, setSearch] = useState("")
  const [selectedLocalites, setSelectedLocalites] =
    useState<string[]>(allLocalites)
  const [selectedFondations, setSelectedFondations] =
    useState<string[]>(allFondations)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  )
  const [groupByLocalite, setGroupByLocalite] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [fullScreenIndex, setFullScreenIndex] = useState(0)

  const listRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const resetFilters = () => {
    setSearch("")
    setSelectedLocalites(allLocalites)
    setSelectedFondations(allFondations)
    setGroupByLocalite(false)
  }

  const isFiltered =
    search !== "" ||
    selectedLocalites.length !== allLocalites.length ||
    selectedFondations.length !== allFondations.length ||
    groupByLocalite

  const properties = initialProperties

  // Sync list scroll when a property is selected
  useEffect(() => {
    if (selectedProperty) {
      const el = listRefs.current.get(selectedProperty.id)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    }
  }, [selectedProperty])

  const filtered = useMemo(() => {
    return properties
      .filter((p) => {
        const name = p.name || ""
        const address1 = p.address1 || ""
        const address2 = p.address2 || ""
        const localite = p.localite || ""
        const fondation = p.fondation || ""

        const matchSearch =
          name.toLowerCase().includes(search.toLowerCase()) ||
          address1.toLowerCase().includes(search.toLowerCase()) ||
          address2.toLowerCase().includes(search.toLowerCase())

        const matchLocalite = selectedLocalites.includes(localite)
        const matchFondation = selectedFondations.includes(fondation)

        return matchSearch && matchLocalite && matchFondation
      })
      .sort((a, b) =>
        (a.name || a.address1).localeCompare(b.name || b.address1)
      )
  }, [search, selectedLocalites, selectedFondations, properties])

  const groupedProperties = useMemo(() => {
    if (!groupByLocalite) return { [dict.dashboard.allProperties]: filtered }

    const groups: Record<string, Property[]> = {}
    filtered.forEach((p) => {
      const key = p.localite || dict.dashboard.unknownLocalite
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    })

    // Sort keys (Localités) alphabetically
    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    )
  }, [
    filtered,
    groupByLocalite,
    dict.dashboard.allProperties,
    dict.dashboard.unknownLocalite,
  ])

  const renderPropertyCard = (p: Property) => (
    <div
      key={p.id}
      ref={(el) => {
        if (el) listRefs.current.set(p.id, el)
        else listRefs.current.delete(p.id)
      }}
      onClick={() => setSelectedProperty(p)}
      onMouseEnter={() => prefetchImages(p.images)}
      className={`group cursor-pointer border-b border-border p-6 transition-all duration-200 ease-out ${
        selectedProperty?.id === p.id
          ? "relative z-10 bg-primary text-primary-foreground shadow-xl"
          : "hover:bg-card-hover active:bg-muted"
      }`}
    >
      <h3 className="text-sm leading-none font-black uppercase">
        {p.name || p.address1}
      </h3>
      <div className="mt-2 flex items-start gap-1.5 opacity-60">
        <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
        <div className="flex flex-col">
          <p className="text-[10px] leading-relaxed font-medium">
            {p.address1}
          </p>
          {p.address2 && (
            <p className="text-[10px] leading-relaxed font-medium opacity-70">
              {p.address2}
            </p>
          )}
        </div>
      </div>
      {p.localite && !groupByLocalite && (
        <div className="mt-3 flex gap-2">
          <div className="rounded border border-current px-1.5 py-0.5 text-[9px] font-bold uppercase opacity-60">
            {p.localite}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* 1. Map Foundation */}
      <main className="absolute inset-0 z-0" role="main">
        <PropertyMap
          properties={filtered}
          onSelect={setSelectedProperty}
          selectedProperty={selectedProperty}
          onHover={(p) => prefetchImages(p.images)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dict={{ ...dict.map, dashboard: dict.dashboard } as any}
        />
      </main>

      {/* 2. Floating Sidebar */}
      <MapSidebar
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dictionary={dict as any}
        search={search}
        onSearch={setSearch}
        onReset={resetFilters}
        isFiltered={isFiltered}
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden">
                <Image
                  src={logo}
                  alt="FIDP Logo"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="text-lg font-black tracking-tighter text-foreground uppercase">
                {dict.common.title}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher dict={dict} currentLang={lang} />
              <ModeToggle />
              <Link
                href={`/${lang}/about`}
                className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-glass-border bg-glass text-lg font-medium shadow-lg backdrop-blur-md transition-all hover:bg-muted"
                title={dict.common.about}
              >
                ?
              </Link>
            </div>
          </div>
        }
        filters={
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between px-1">
              <Label
                htmlFor="group-by-localite-sidebar"
                className="cursor-pointer text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
              >
                {dict.dashboard.groupByLocalite}
              </Label>
              <Switch
                id="group-by-localite-sidebar"
                checked={groupByLocalite}
                onCheckedChange={setGroupByLocalite}
              />
            </div>
            <div className="grid gap-2">
              <MultiSelectCombobox
                options={allLocalites}
                selected={selectedLocalites}
                onChange={setSelectedLocalites}
                placeholder={dict.dashboard.localites}
                allLabel={dict.dashboard.allLocalites}
                icon={MapPin}
                className="w-full rounded-[4px] bg-background"
              />
              <MultiSelectCombobox
                options={allFondations}
                selected={selectedFondations}
                onChange={setSelectedFondations}
                placeholder={dict.dashboard.fondations}
                allLabel={dict.dashboard.allFondations}
                icon={Building2}
                className="w-full rounded-[4px] bg-background"
              />
            </div>
          </div>
        }
      >
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between bg-header px-6 py-3">
            <h2 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              {filtered.length}{" "}
              {dict.dashboard.propertiesCount.split("{count}")[1].trim() ||
                "RESULTS"}
            </h2>
          </div>

          {filtered.length > 0 ? (
            <div className="divide-y divide-border">
              {Object.entries(groupedProperties).map(
                ([groupName, groupItems]) => (
                  <div key={groupName}>
                    {groupByLocalite && (
                      <div className="sticky top-0 z-10 flex items-center gap-2 border-y border-border bg-header/90 px-5 py-2 backdrop-blur-sm">
                        <Layers className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                          {groupName}
                        </span>
                        <div className="ml-auto text-[10px] font-black text-muted-foreground">
                          {groupItems.length}
                        </div>
                      </div>
                    )}
                    <div className="divide-y divide-border">
                      {groupItems.map(renderPropertyCard)}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Globe className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-balance text-muted-foreground">
                {dict.dashboard.noMatch}
              </p>
            </div>
          )}
        </div>
      </MapSidebar>

      <PropertyDetailsSidebar
        property={selectedProperty}
        dict={dict}
        onClose={() => setSelectedProperty(null)}
        onOpenFullScreen={(index) => {
          setFullScreenIndex(index)
          setIsFullScreen(true)
        }}
      />

      {/* 3. Full-screen Carousel Dialog */}
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent
          showCloseButton={true}
          className="z-2001 flex h-screen! w-screen! max-w-none! items-center justify-center gap-0 border-none! bg-transparent! p-0! shadow-none!"
        >
          <DialogTitle className="sr-only">Full size images</DialogTitle>
          {selectedProperty ? (
            selectedProperty.images && selectedProperty.images.length > 0 ? (
              <div className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-transparent">
                {/* Header Info */}
                <div className="pointer-events-none absolute top-6 left-1/2 z-2010 -translate-x-1/2 rounded-xl border border-white/20 bg-black/80 px-6 py-2 text-sm font-black tracking-[0.2em] text-white uppercase shadow-2xl backdrop-blur-md">
                  {selectedProperty.name || selectedProperty.address1}
                </div>

                {/* Main Carousel Area */}
                <Carousel
                  className="h-full w-full"
                  opts={{
                    loop: true,
                    startIndex: fullScreenIndex,
                  }}
                >
                  <CarouselContent className="ml-0 h-screen">
                    {selectedProperty.images.map((img, index) => (
                      <CarouselItem
                        key={`fs-${img}`}
                        className="flex h-dvh w-screen items-center justify-center pl-0"
                      >
                        <div className="relative flex h-full w-full items-center justify-center p-4 md:p-20">
                          <Image
                            src={img}
                            alt={`${selectedProperty.name || selectedProperty.address1} - Full Photo ${index + 1}`}
                            fill
                            unoptimized
                            className="object-contain"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  {/* Explicit Navigation Controls */}
                  {selectedProperty.images.length > 1 && (
                    <>
                      <CarouselPrevious className="left-8 z-2015 size-20 rounded-2xl border-white/20 bg-black/50 text-white transition-all hover:bg-white hover:text-black" />
                      <CarouselNext className="right-8 z-2015 size-20 rounded-2xl border-white/20 bg-black/50 text-white transition-all hover:bg-white hover:text-black" />
                    </>
                  )}
                </Carousel>
                {/* Close Button Hint */}
                <div className="absolute top-4 right-16 z-2010 text-[10px] font-black tracking-widest text-white/40 uppercase">
                  {dict.details.escToClose}
                </div>
              </div>
            ) : (
              <div className="font-black tracking-widest text-white uppercase">
                {dict.details.noPhoto}
              </div>
            )
          ) : (
            <div className="font-black tracking-widest text-white uppercase">
              Error: No property selected.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
