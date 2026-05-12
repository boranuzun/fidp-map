"use client"

import { usePathname, useRouter } from "next/navigation"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Globe, ChevronDown } from "lucide-react"

interface LanguageSwitcherProps {
  dict: {
    common: {
      french: string
      english: string
      german: string
      italian: string
      language: string
    }
  }
  currentLang: string
}

export default function LanguageSwitcher({
  dict,
  currentLang,
}: LanguageSwitcherProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLanguageChange = (newLang: string) => {
    if (!pathname) return
    const segments = pathname.split("/")
    segments[1] = newLang
    const newPath = segments.join("/")
    router.push(newPath)
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label={dict.common.language}
          className="flex cursor-pointer items-center gap-2 rounded-[4px] border border-border bg-background px-3 py-2 text-[10px] font-black tracking-widest uppercase shadow-lg transition-all hover:bg-muted focus:outline-none"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>{currentLang.toUpperCase()}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[120px] animate-in overflow-hidden rounded-[4px] border border-border bg-background shadow-2xl duration-200 zoom-in-95 fade-in"
        >
          <DropdownMenu.Item
            onSelect={() => handleLanguageChange("fr")}
            className="flex cursor-pointer items-center justify-between px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors hover:bg-foreground hover:text-background focus:outline-none"
          >
            <span>{dict.common.french}</span>
            <span className="text-[8px] opacity-50">FR</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => handleLanguageChange("en")}
            className="flex cursor-pointer items-center justify-between px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors hover:bg-foreground hover:text-background focus:outline-none"
          >
            <span>{dict.common.english}</span>
            <span className="text-[8px] opacity-50">EN</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => handleLanguageChange("de")}
            className="flex cursor-pointer items-center justify-between px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors hover:bg-foreground hover:text-background focus:outline-none"
          >
            <span>{dict.common.german}</span>
            <span className="text-[8px] opacity-50">DE</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => handleLanguageChange("it")}
            className="flex cursor-pointer items-center justify-between px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors hover:bg-foreground hover:text-background focus:outline-none"
          >
            <span>{dict.common.italian}</span>
            <span className="text-[8px] opacity-50">IT</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
