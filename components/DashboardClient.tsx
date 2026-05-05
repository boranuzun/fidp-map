"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  } from './ui/carousel';
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog"
import { MultiSelectCombobox } from "./ui/multi-select-combobox"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { type Property } from "./PropertyMap"
import {
  Building2,
  MapPin,
  Users,
  Globe,
  Landmark,
  Layers,
  Calendar,
  Hash,
} from "lucide-react"

const PropertyMap = dynamic(() => import("./PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full animate-pulse items-center justify-center bg-slate-100 text-slate-400">
      Loading Map...
    </div>
  ),
})

const prefetchImages = (images?: string[] | null) => {
  if (!images || images.length === 0) return;
  images.forEach((url) => {
    const img = new globalThis.Image();
    img.src = url;
  });
};

export default function DashboardClient({
  initialProperties,
}: {
  initialProperties: Property[]
}) {
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenIndex, setFullScreenIndex] = useState(0);

  const listRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const resetFilters = () => {
    setSearch("")
    setSelectedLocalites(allLocalites)
    setSelectedFondations(allFondations)
    setGroupByLocalite(false)
  }

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
        const address = p.address || ""
        const localite = p.localite || ""
        const fondation = p.fondation || ""

        const matchSearch =
          name.toLowerCase().includes(search.toLowerCase()) ||
          address.toLowerCase().includes(search.toLowerCase())

        const matchLocalite = selectedLocalites.includes(localite)
        const matchFondation = selectedFondations.includes(fondation)

        return matchSearch && matchLocalite && matchFondation
      })
      .sort((a, b) => (a.name || a.address).localeCompare(b.name || b.address))
  }, [search, selectedLocalites, selectedFondations, properties])

  const groupedProperties = useMemo(() => {
    if (!groupByLocalite) return { "All Properties": filtered }

    const groups: Record<string, Property[]> = {}
    filtered.forEach((p) => {
      const key = p.localite || "Unknown"
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    })

    // Sort keys (Localités) alphabetically
    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    )
  }, [filtered, groupByLocalite])

  const renderPropertyCard = (p: Property) => (
    <div
      key={p.id}
      ref={(el) => {
        if (el) listRefs.current.set(p.id, el)
        else listRefs.current.delete(p.id)
      }}
      onClick={() => setSelectedProperty(p)}
      onMouseEnter={() => prefetchImages(p.images)}
      className={`group cursor-pointer border-b border-black/10 p-6 transition-colors ${selectedProperty?.id === p.id ? "bg-black text-white" : "hover:bg-black hover:text-white"}`}
    >
      <h3 className="text-sm leading-none font-black uppercase">
        {p.name || p.address}
      </h3>
      <div className="mt-2 flex items-start gap-1.5 opacity-60">
        <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
        <p className="text-[10px] leading-relaxed font-medium">{p.address}</p>
      </div>
      {p.localite && !groupByLocalite && (
        <div className="mt-3 flex gap-2">
          <div className="border-2 border-current px-1.5 py-0.5 text-[9px] font-bold uppercase">
            {p.localite}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="border-b-swiss z-20 flex h-16 shrink-0 items-center justify-between border-black bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-black">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div className="text-2xl font-black tracking-tighter text-black uppercase">
            GENEVA MAP
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-3">
            <Switch
              id="group-by-localite"
              checked={groupByLocalite}
              onCheckedChange={setGroupByLocalite}
            />
            <Label
              htmlFor="group-by-localite"
              className="cursor-pointer text-[10px] font-bold tracking-widest text-black uppercase"
            >
              GROUP BY LOCALITÉ
            </Label>
          </div>

          <div className="bg-black px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase">
            {filtered.length} PROPERTIES
          </div>

          <Link
            href="/about"
            className="flex size-8 items-center justify-center border-2 border-black font-black transition-colors hover:bg-black hover:text-white"
            title="À propos"
          >
            ?
          </Link>
        </div>
      </header>

      <div className="border-b-swiss z-10 flex h-14 shrink-0 items-center gap-4 border-black bg-white px-6">
        <div className="relative max-w-md flex-1">
          <Input
            placeholder="SEARCH PROPERTIES..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-swiss h-10 border-black bg-white px-4 font-black placeholder:text-black/30 focus:ring-0"
          />
        </div>
        <MultiSelectCombobox
          options={allLocalites}
          selected={selectedLocalites}
          onChange={setSelectedLocalites}
          placeholder="LOCALITÉS"
          allLabel="ALL LOCALITÉS"
          icon={MapPin}
          className="min-w-[200px]"
        />
        <MultiSelectCombobox
          options={allFondations}
          selected={selectedFondations}
          onChange={setSelectedFondations}
          placeholder="FONDATIONS"
          allLabel="ALL FONDATIONS"
          icon={Building2}
          className="min-w-[200px]"
        />
        <Button
          onClick={resetFilters}
          className="h-10 bg-black px-6 font-black tracking-widest text-white uppercase transition-none hover:bg-black/90"
        >
          RESET FILTERS
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="border-r-swiss z-30 w-80 overflow-y-auto border-black bg-white">
          <div className="border-b-swiss border-black p-6">
            <h2 className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">
              Filtered Results ({filtered.length})
            </h2>
          </div>
          {filtered.length > 0 ? (
            <div className="divide-y divide-black/10">
              {Object.entries(groupedProperties).map(
                ([groupName, groupItems]) => (
                  <div key={groupName}>
                    {groupByLocalite && (
                      <div className="border-b-swiss sticky top-0 z-10 flex items-center gap-2 border-black bg-slate-50 px-5 py-2">
                        <Layers className="h-3 w-3 opacity-30" />
                        <span className="text-[10px] font-black tracking-widest uppercase">
                          {groupName}
                        </span>
                        <div className="ml-auto border-2 border-black/20 px-1 text-[10px] font-black">
                          {groupItems.length}
                        </div>
                      </div>
                    )}
                    <div className="divide-y divide-black/10">
                      {groupItems.map(renderPropertyCard)}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Globe className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-balance text-slate-500">
                No properties match your filters.
              </p>
            </div>
          )}
        </aside>

        <main className="relative flex-1">
          <PropertyMap
            properties={filtered}
            onSelect={setSelectedProperty}
            selectedProperty={selectedProperty}
            onHover={(p) => prefetchImages(p.images)}
          />
        </main>
      </div>

      <Sheet
        modal={false}
        open={!!selectedProperty}
        onOpenChange={(open) => {
          if (!open && !isFullScreen) {
            setSelectedProperty(null)
          }
        }}
      >
        <SheetContent
          side="right"
          className="mt-16 h-[calc(100vh-4rem)] gap-0 border-l-[3px] border-black p-0 shadow-none sm:max-w-md"
        >
          <SheetDescription className="sr-only">
            Details and information about the selected property.
          </SheetDescription>
          <div className="flex h-full flex-col bg-white">
            <div className="group/carousel relative h-72 shrink-0 overflow-hidden bg-black">
              {selectedProperty?.images &&
              selectedProperty.images.length > 0 ? (
                <Carousel className="h-full w-full" opts={{ loop: true }}>
                  <CarouselContent className="ml-0 h-72">
                    {selectedProperty.images.map((img, index) => (
                      <CarouselItem
                        key={img}
                        className="relative h-full cursor-zoom-in pl-0"
                        onClick={() => {
                          setFullScreenIndex(index)
                          setIsFullScreen(true)
                        }}
                      >
                        <Image
                          src={img}
                          alt={`${selectedProperty.name || selectedProperty.address} - Photo ${index + 1}`}
                          fill
                          unoptimized
                          className="h-full w-full object-cover opacity-90 transition-opacity hover:opacity-100"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {selectedProperty.images.length > 1 && (
                    <>
                      <CarouselPrevious className="left-2 opacity-0 transition-opacity group-hover/carousel:opacity-100" />
                      <CarouselNext className="right-2 opacity-0 transition-opacity group-hover/carousel:opacity-100" />
                    </>
                  )}
                </Carousel>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-black text-white">
                  <Building2 className="mb-2 h-12 w-12 opacity-20" />
                  <span className="text-[10px] font-black tracking-widest uppercase opacity-40">
                    No photo available
                  </span>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
              <div className="pointer-events-none absolute right-8 bottom-8 left-8 text-white">
                <SheetHeader className="space-y-0 p-0">
                  <SheetTitle className="text-4xl leading-none font-black tracking-tighter text-white uppercase">
                    {selectedProperty?.name || selectedProperty?.address}
                  </SheetTitle>
                </SheetHeader>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10">
              <div className="space-y-12">
                <section>
                  <h4 className="border-b-swiss mb-6 flex items-center gap-2 border-black pb-2 text-[10px] font-black tracking-[0.2em] text-black uppercase">
                    <MapPin className="h-3.5 w-3.5" /> Location Details
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <p className="mb-1 text-[9px] font-bold uppercase opacity-40">
                        Full Address
                      </p>
                      <p className="text-base leading-tight font-black">
                        {selectedProperty?.address}
                        {selectedProperty?.zip && (
                          <span className="ml-2 font-medium tracking-tight opacity-40">
                            ({selectedProperty.zip})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 border-t border-black/10 pt-6">
                      <div>
                        <p className="mb-1 text-[9px] font-bold uppercase opacity-40">
                          Localité
                        </p>
                        <p className="text-sm font-black uppercase">
                          {selectedProperty?.localite || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-[9px] font-bold uppercase opacity-40">
                          Units
                        </p>
                        <div className="flex items-center gap-1.5 text-sm font-black uppercase">
                          <Users className="h-4 w-4" />
                          {selectedProperty?.units || "Unknown"}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="border-b-swiss mb-6 flex items-center gap-2 border-black pb-2 text-[10px] font-black tracking-[0.2em] text-black uppercase">
                    <Landmark className="h-3.5 w-3.5" /> Management & History
                  </h4>
                  <div className="grid gap-4">
                    <div className="border-swiss flex items-center justify-between border-black p-5">
                      <span className="text-[10px] font-bold uppercase opacity-40">
                        Fondation
                      </span>
                      <span className="text-sm font-black uppercase">
                        {selectedProperty?.fondation || "N/A"}
                      </span>
                    </div>
                    {selectedProperty?.construction_year && (
                      <div className="border-swiss flex items-center justify-between border-black p-5">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase opacity-40">
                          <Calendar className="h-3 w-3" /> Construction
                        </span>
                        <span className="text-sm font-black uppercase">
                          Built in {selectedProperty.construction_year}
                        </span>
                      </div>
                    )}
                    <div className="border-swiss flex items-center justify-between border-black p-5">
                      <span className="text-[10px] font-bold uppercase opacity-40">
                        Group
                      </span>
                      <span className="text-sm font-black uppercase">
                        {selectedProperty?.group || "N/A"}
                      </span>
                    </div>
                  </div>
                </section>

                {selectedProperty?.tags && selectedProperty.tags.length > 0 && (
                  <section>
                    <h4 className="border-b-swiss mb-6 flex items-center gap-2 border-black pb-2 text-[10px] font-black tracking-[0.2em] text-black uppercase">
                      <Hash className="h-3.5 w-3.5" /> Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProperty.tags.map((tag) => (
                        <div
                          key={tag}
                          className="bg-black px-2 py-1 text-[9px] font-black tracking-wider text-white uppercase"
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>

            <div className="border-t-swiss border-black bg-white p-8">
              <a
                href={selectedProperty?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center bg-black py-5 text-xs font-black tracking-[0.2em] text-white uppercase transition-colors hover:bg-slate-900"
              >
                Visit Official Site
              </a>
            </div>
          </div>
        </SheetContent>
      </Sheet>

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
                <div className="pointer-events-none absolute top-6 left-1/2 z-2010 -translate-x-1/2 border-2 border-white bg-black/80 px-6 py-2 text-sm font-black tracking-[0.2em] text-white uppercase">
                  {selectedProperty.name || selectedProperty.address}
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
                            alt={`${selectedProperty.name || selectedProperty.address} - Full Photo ${index + 1}`}
                            fill
                            unoptimized
                            className="border-2 border-white/10 object-contain shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  {/* Explicit Navigation Controls */}
                  {selectedProperty.images.length > 1 && (
                    <>
                      <CarouselPrevious className="left-8 z-2015 size-20 border-4 border-white bg-black/50 text-white transition-all hover:bg-white hover:text-black" />
                      <CarouselNext className="right-8 z-2015 size-20 border-4 border-white bg-black/50 text-white transition-all hover:bg-white hover:text-black" />
                    </>
                  )}
                </Carousel>
                {/* Close Button Hint */}
                <div className="absolute top-4 right-16 z-2010 text-[10px] font-black tracking-widest text-white/40 uppercase">
                  ESC TO CLOSE
                </div>
              </div>
            ) : (
              <div className="font-black tracking-widest text-white uppercase">
                No images available for this property.
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
