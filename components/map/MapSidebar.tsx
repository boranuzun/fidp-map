"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type MapDictionary } from "./types"

interface MapSidebarProps {
  dictionary: MapDictionary
  search: string
  onSearch: (value: string) => void
  onReset: () => void
  isFiltered: boolean
  filters?: React.ReactNode
  children: React.ReactNode
  header?: React.ReactNode
}

export default function MapSidebar({
  dictionary,
  search,
  onSearch,
  onReset,
  isFiltered,
  filters,
  children,
  header,
}: MapSidebarProps) {
  const [showFilters, setShowFilters] = React.useState(false)

  return (
    <aside
      role="complementary"
      className="fixed inset-x-4 bottom-4 z-50 flex animate-in flex-col overflow-hidden rounded-[4px] border border-border bg-background shadow-[0_0_0_2px_rgba(0,0,0,0.1)] transition-all duration-500 ease-in-out fade-in slide-in-from-left-8 md:absolute md:top-4 md:bottom-4 md:left-4 md:w-[400px]"
    >
      {/* Sidebar Header (Logo, etc) */}
      {header && <div className="px-4 pt-4 pb-2">{header}</div>}

      {/* Search Bar */}
      <div className="flex items-center gap-2 p-4">
        <div className="group relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-foreground/60 transition-colors group-focus-within:text-foreground" />
          <Input
            placeholder={dictionary.dashboard?.searchPlaceholder}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="h-12 rounded-[4px] border-border/50 bg-muted pl-10 text-sm font-medium transition-all placeholder:text-muted-foreground focus:border-foreground/40 focus:bg-background dark:border-white/10 dark:bg-white/10 dark:placeholder:text-white/40"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Toggle filters"
          className={`h-12 w-12 rounded-[4px] border-border transition-all ${
            showFilters || isFiltered
              ? "bg-foreground text-background hover:bg-foreground/90"
              : "bg-muted hover:bg-muted/80 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20"
          }`}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Filters Panel */}
      {(showFilters || isFiltered) && filters && (
        <div className="animate-in space-y-3 px-4 pb-4 duration-200 fade-in slide-in-from-top-2">
          <div className="space-y-4 rounded-[4px] border border-border bg-muted/30 p-4">
            {filters}
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={!isFiltered}
              className="h-8 w-full rounded-[4px] text-[10px] font-bold tracking-widest uppercase hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
            >
              {dictionary.dashboard?.resetFilters}
            </Button>
          </div>
        </div>
      )}

      {/* Results / Content */}
      <div className="scrollbar-thin scrollbar-thumb-muted hover:scrollbar-thumb-muted-foreground/30 flex-1 overflow-y-auto">
        {children}
      </div>
    </aside>
  )
}
