"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import PropertyDetailsView from "./PropertyDetailsView"
import { type Property } from "../PropertyMap"

interface PropertyDetailsSidebarProps {
  property: Property | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: Record<string, any>
  onClose: () => void
  onOpenFullScreen: (index: number) => void
}

export default function PropertyDetailsSidebar({
  property,
  dict,
  onClose,
  onOpenFullScreen,
}: PropertyDetailsSidebarProps) {
  if (!property) return null

  return (
    <aside
      role="complementary"
      className="fixed top-4 right-4 bottom-4 z-50 flex w-[calc(100%-2rem)] animate-in flex-col overflow-hidden rounded-[4px] border border-border bg-background shadow-[0_0_0_2px_rgba(0,0,0,0.1)] transition-all duration-500 ease-in-out fade-in slide-in-from-right-8 md:absolute md:w-[450px]"
    >
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close"
          className="h-10 w-10 cursor-pointer rounded-[4px] bg-black/20 text-white backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="scrollbar-thin scrollbar-thumb-muted hover:scrollbar-thumb-muted-foreground/30 flex-1 overflow-y-auto">
        <PropertyDetailsView
          property={property}
          dict={dict}
          onOpenFullScreen={onOpenFullScreen}
        />
      </div>
    </aside>
  )
}
