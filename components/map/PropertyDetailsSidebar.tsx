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
      className="fixed md:absolute top-4 right-4 bottom-4 w-[calc(100%-2rem)] md:w-[450px] z-50 bg-glass backdrop-blur-md rounded-2xl shadow-(--glass-shadow) border border-glass-border flex flex-col overflow-hidden transition-all ease-in-out animate-in fade-in slide-in-from-right-8 duration-500"
    >
      <div className="absolute right-4 top-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close"
          className="h-10 w-10 rounded-xl bg-black/20 text-white backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white cursor-pointer"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted hover:scrollbar-thumb-muted-foreground/30">
        <PropertyDetailsView
          property={property}
          dict={dict}
          onOpenFullScreen={onOpenFullScreen}
        />
      </div>
    </aside>
  )
}
