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
      className="fixed inset-x-4 bottom-4 md:absolute md:top-4 md:left-4 md:bottom-4 md:w-[400px] z-50 bg-glass backdrop-blur-md rounded-2xl shadow-(--glass-shadow) border border-glass-border flex flex-col overflow-hidden transition-all ease-in-out animate-in fade-in slide-in-from-left-8 duration-500"
    >
      {/* Sidebar Header (Logo, etc) */}
      {header && (
        <div className="px-4 pt-4 pb-2">
          {header}
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4 flex gap-2 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-active-icon transition-colors" />
          <Input
            placeholder={dictionary.dashboard?.searchPlaceholder}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 bg-background/80 placeholder:text-muted-foreground/80 border-transparent focus:bg-background focus:border-active-icon/30 h-12 rounded-xl text-sm font-medium transition-all"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Toggle filters"
          className={`h-12 w-12 rounded-xl border-border transition-all ${showFilters || isFiltered ? 'bg-blue-50 border-blue-200 text-blue-600' : 'hover:bg-muted'}`}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Filters Panel */}
      {(showFilters || isFiltered) && filters && (
        <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 bg-header rounded-xl space-y-4 border border-border">
            {filters}
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={!isFiltered}
              className="w-full text-[10px] font-bold uppercase tracking-widest h-8 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
            >
              {dictionary.dashboard?.resetFilters}
            </Button>
          </div>
        </div>
      )}

      {/* Results / Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted hover:scrollbar-thumb-muted-foreground/30">
        {children}
      </div>
    </aside>
  )
}
