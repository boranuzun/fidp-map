"use client"

import * as React from "react"
import Image from "next/image"
import { 
  Building2, 
  MapPin, 
  Users, 
  Landmark, 
  Calendar, 
  Hash 
} from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { type Property } from "../PropertyMap"

interface PropertyDetailsViewProps {
  property: Property
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: Record<string, any>
  onOpenFullScreen: (index: number) => void
}

export default function PropertyDetailsView({
  property,
  dict,
  onOpenFullScreen,
}: PropertyDetailsViewProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="group/carousel relative h-72 shrink-0 overflow-hidden bg-black">
        {property.images && property.images.length > 0 ? (
          <Carousel className="h-full w-full" opts={{ loop: true }}>
            <CarouselContent className="ml-0 h-72">
              {property.images.map((img, index) => (
                <CarouselItem
                  key={img}
                  className="relative h-full cursor-zoom-in pl-0"
                  onClick={() => onOpenFullScreen(index)}
                >
                  <Image
                    src={img}
                    alt={`${property.name || property.address} - Photo ${index + 1}`}
                    fill
                    unoptimized
                    className="h-full w-full object-cover opacity-90 transition-opacity hover:opacity-100"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {property.images.length > 1 && (
              <>
                <CarouselPrevious className="left-2 opacity-0 transition-opacity group-hover/carousel:opacity-100" />
                <CarouselNext className="right-2 opacity-0 transition-opacity group-hover/carousel:opacity-100" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-muted text-foreground">
            <Building2 className="mb-2 h-12 w-12 opacity-20" />
            <span className="text-[10px] font-black tracking-widest uppercase opacity-40">
              {dict.details.noPhoto}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
        <div className="pointer-events-none absolute right-8 bottom-8 left-8 text-white">
          <div className="space-y-0 p-0">
            <h3 className="text-3xl leading-none font-black tracking-tighter text-white uppercase">
              {property.name || property.address}
            </h3>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="space-y-10">
          <section>
            <h4 className="border-b mb-4 flex items-center gap-2 border-border pb-2 text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
              <MapPin className="h-3.5 w-3.5" />{" "}
              {dict.details.locationDetails}
            </h4>
            <div className="space-y-6">
              <div>
                <p className="mb-1 text-[9px] font-bold uppercase opacity-40">
                  {dict.details.fullAddress}
                </p>
                <p className="text-base leading-tight font-black">
                  {property.address}
                  {property.zip && (
                    <span className="ml-2 font-medium tracking-tight opacity-40">
                      ({property.zip})
                    </span>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 border-t border-border pt-6">
                <div>
                  <p className="mb-1 text-[9px] font-bold uppercase opacity-40">
                    {dict.details.localite}
                  </p>
                  <p className="text-sm font-black uppercase">
                    {property.localite || dict.details.notAvailable}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[9px] font-bold uppercase opacity-40">
                    {dict.details.units}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm font-black uppercase">
                    <Users className="h-4 w-4" />
                    {property.units || dict.details.unknown}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h4 className="border-b mb-4 flex items-center gap-2 border-border pb-2 text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
              <Landmark className="h-3.5 w-3.5" />{" "}
              {dict.details.mgmtHistory}
            </h4>
            <div className="grid gap-3">
              <div className="rounded-xl bg-header flex items-center justify-between p-4">
                <span className="text-[10px] font-bold uppercase opacity-40">
                  {dict.details.fondation}
                </span>
                <span className="text-sm font-black uppercase">
                  {property.fondation || dict.details.notAvailable}
                </span>
              </div>
              {property.construction_year && (
                <div className="rounded-xl bg-header flex items-center justify-between p-4">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase opacity-40">
                    <Calendar className="h-3 w-3" />{" "}
                    {dict.details.construction}
                  </span>
                  <span className="text-sm font-black uppercase">
                    {dict.details.builtIn.replace(
                      "{year}",
                      property.construction_year.toString()
                    )}
                  </span>
                </div>
              )}
              <div className="rounded-xl bg-header flex items-center justify-between p-4">
                <span className="text-[10px] font-bold uppercase opacity-40">
                  {dict.details.group}
                </span>
                <span className="text-sm font-black uppercase">
                  {property.group || dict.details.notAvailable}
                </span>
              </div>
            </div>
          </section>

          {property.tags && property.tags.length > 0 && (
            <section>
              <h4 className="border-b mb-4 flex items-center gap-2 border-border pb-2 text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                <Hash className="h-3.5 w-3.5" /> {dict.details.tags}
              </h4>
              <div className="flex flex-wrap gap-2">
                {property.tags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-secondary rounded px-2 py-1 text-[9px] font-black tracking-wider text-secondary-foreground uppercase"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background p-6">
        <a
          href={property.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center bg-blue-600 rounded-xl py-4 text-xs font-black tracking-[0.2em] text-white uppercase transition-all hover:bg-blue-700 shadow-lg"
        >
          {dict.dashboard.visitSite}
        </a>
      </div>
    </div>
  )
}
