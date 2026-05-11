"use client"

import * as React from "react"
import Image from "next/image"
import { Building2, Globe } from "lucide-react"
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

const DataRow = ({
  label,
  value,
  notAvailableText,
}: {
  label: string
  value?: string | null
  notAvailableText: string
}) => (
  <div className="flex items-baseline justify-between py-1">
    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
      {label}
    </span>
    <span className="text-sm font-black uppercase">
      {value || notAvailableText}
    </span>
  </div>
)

const GoogleMapsIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 256 367"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#34a853"
      d="M70.585 271.865a371 371 0 0 1 28.911 42.642c7.374 13.982 10.448 23.463 15.837 40.31c3.305 9.308 6.292 12.086 12.714 12.086c6.998 0 10.173-4.726 12.626-12.035c5.094-15.91 9.091-28.052 15.397-39.525c12.374-22.15 27.75-41.833 42.858-60.75c4.09-5.354 30.534-36.545 42.439-61.156c0 0 14.632-27.035 14.632-64.792c0-35.318-14.43-59.813-14.43-59.813l-41.545 11.126l-25.23 66.451l-6.242 9.163l-1.248 1.66l-1.66 2.078l-2.914 3.319l-4.164 4.163l-22.467 18.304l-56.17 32.432z"
    />
    <path
      fill="#fbbc04"
      d="M12.612 188.892c13.709 31.313 40.145 58.839 58.031 82.995l95.001-112.534s-13.384 17.504-37.662 17.504c-27.043 0-48.89-21.595-48.89-48.825c0-18.673 11.234-31.501 11.234-31.501l-64.489 17.28z"
    />
    <path
      fill="#4285f4"
      d="M166.705 5.787c31.552 10.173 58.558 31.53 74.893 63.023l-75.925 90.478s11.234-13.06 11.234-31.617c0-27.864-23.463-48.68-48.81-48.68c-23.969 0-37.735 17.475-37.735 17.475v-57z"
    />
    <path
      fill="#1a73e8"
      d="M30.015 45.765C48.86 23.218 82.02 0 127.736 0c22.18 0 38.89 5.823 38.89 5.823L90.29 96.516H36.205z"
    />
    <path
      fill="#ea4335"
      d="M12.612 188.892S0 164.194 0 128.414c0-33.817 13.146-63.377 30.015-82.649l60.318 50.759z"
    />
  </svg>
)

export default function PropertyDetailsView({
  property,
  dict,
  onOpenFullScreen,
}: PropertyDetailsViewProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="group/carousel relative h-80 shrink-0 overflow-hidden bg-black">
        {property.images && property.images.length > 0 ? (
          <Carousel className="h-full w-full" opts={{ loop: true }}>
            <CarouselContent className="ml-0 h-80">
              {property.images.map((img, index) => (
                <CarouselItem
                  key={img}
                  className="relative h-full cursor-zoom-in pl-0"
                  onClick={() => onOpenFullScreen(index)}
                >
                  <Image
                    src={img}
                    alt={`${property.name || property.address1} - Photo ${index + 1}`}
                    fill
                    unoptimized
                    className="h-full w-full object-cover"
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
          </div>
        )}
        {/* Modern Fade Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />

        {/* Title Overlay */}
        <div className="pointer-events-none absolute right-8 bottom-8 left-8">
          <h3 className="text-3xl leading-tight font-black tracking-tighter text-foreground uppercase drop-shadow-sm">
            {property.name || property.address1}
          </h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <section className="space-y-6">
          <div>
            <div className="text-lg leading-tight font-black uppercase">
              {property.address1}
            </div>
            {property.address2 && (
              <div className="mt-1 text-lg leading-tight font-black uppercase">
                {property.address2}
              </div>
            )}
            <div className="mt-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
              {property.zip} {property.localite}
            </div>
          </div>

          {/* Metadata List */}
          <div className="flex flex-col gap-y-3 border-t border-border/20 pt-6">
            <DataRow
              label={dict.details.fondation || "FONDATION"}
              value={property.fondation}
              notAvailableText={dict.details.notAvailable}
            />
            <DataRow
              label={dict.details.construction || "CONSTRUCTION"}
              value={property.construction_year?.toString()}
              notAvailableText={dict.details.notAvailable}
            />
            <DataRow
              label={dict.details.units || "UNITS"}
              value={property.units?.toString()}
              notAvailableText={dict.details.notAvailable}
            />
            <DataRow
              label={dict.details.group || "GROUP"}
              value={property.group}
              notAvailableText={dict.details.notAvailable}
            />
          </div>

          {property.tags && property.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {property.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[4px] bg-muted px-2 py-0.5 text-[9px] font-bold tracking-wider text-muted-foreground uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="border-t border-border/20 bg-background p-6">
        <div className="flex gap-3">
          <a
            href={property.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-[4px] bg-foreground py-4 text-[10px] font-black tracking-widest text-background uppercase transition-all hover:opacity-90"
          >
            <Globe className="h-3.5 w-3.5" />
            {dict.dashboard.visitSite || "OFFICIAL SITE"}
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.address1}, ${property.zip} ${property.localite}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-[4px] border-2 border-foreground py-4 text-[10px] font-black tracking-widest uppercase transition-all hover:bg-muted"
          >
            <GoogleMapsIcon className="h-4 w-auto" />
            {dict.details.googleMaps || "GOOGLE MAPS"}
          </a>
        </div>
      </div>
    </div>
  )
}
