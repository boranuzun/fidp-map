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

export default function LanguageSwitcher({ dict, currentLang }: LanguageSwitcherProps) {
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
          className="flex items-center gap-2 bg-glass backdrop-blur-md border border-glass-border rounded-xl shadow-lg px-3 py-2 font-black uppercase text-[10px] tracking-widest hover:bg-card-hover transition-all cursor-pointer focus:outline-none"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{currentLang.toUpperCase()}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[120px] bg-glass backdrop-blur-xl border border-glass-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          <DropdownMenu.Item
            onSelect={() => handleLanguageChange("fr")}
            className="flex items-center justify-between px-4 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-foreground hover:text-background transition-colors focus:outline-none"
          >
            <span>{dict.common.french}</span>
            <span className="opacity-50 text-[8px]">FR</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => handleLanguageChange("en")}
            className="flex items-center justify-between px-4 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-foreground hover:text-background transition-colors focus:outline-none"
          >
            <span>{dict.common.english}</span>
            <span className="opacity-50 text-[8px]">EN</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => handleLanguageChange("de")}
            className="flex items-center justify-between px-4 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-foreground hover:text-background transition-colors focus:outline-none"
          >
            <span>{dict.common.german}</span>
            <span className="opacity-50 text-[8px]">DE</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => handleLanguageChange("it")}
            className="flex items-center justify-between px-4 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-foreground hover:text-background transition-colors focus:outline-none"
          >
            <span>{dict.common.italian}</span>
            <span className="opacity-50 text-[8px]">IT</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
