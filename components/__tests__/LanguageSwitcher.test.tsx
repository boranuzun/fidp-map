import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import LanguageSwitcher from "../ui/language-switcher"

// Mock next/navigation
const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  usePathname: () => "/fr/about",
  useRouter: () => ({ push: mockPush }),
}))

describe("LanguageSwitcher", () => {
  it("renders with current language", () => {
    const dict = { common: { french: "Français", english: "English", language: "Language" } }
    render(<LanguageSwitcher dict={dict} currentLang="fr" />)
    expect(screen.getByRole("combobox")).toHaveValue("fr")
  })

  it("calls router.push when language changes", () => {
    const dict = { common: { french: "Français", english: "English", language: "Language" } }
    render(<LanguageSwitcher dict={dict} currentLang="fr" />)
    
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "en" } })
    expect(mockPush).toHaveBeenCalledWith("/en/about")
  })
})
