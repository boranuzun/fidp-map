"use client"

import { usePathname, useRouter } from "next/navigation"

interface LanguageSwitcherProps {
  dict: {
    common: {
      french: string
      english: string
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
    <div className="relative">
      <select
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value)}
        aria-label={dict.common.language}
        className="appearance-none bg-white border-2 border-black px-3 pr-8 py-1 text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer hover:bg-black hover:text-white transition-colors"
      >
        <option value="fr">{dict.common.french} (FR)</option>
        <option value="en">{dict.common.english} (EN)</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current">
        <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  )
}
