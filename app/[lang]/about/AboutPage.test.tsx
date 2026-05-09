import { render, screen } from "@testing-library/react"
import AboutPage from "./page"
import { vi, describe, it, expect } from "vitest"
import dict from "../../../dictionaries/en.json"
import { Locale } from "@/i18n-config"

vi.mock("@/lib/get-dictionary", () => ({
  getDictionary: vi.fn(() => Promise.resolve(dict)),
}))

describe("AboutPage", () => {
  it("renders with the optimized minimalist white design", async () => {
    // Correctly typed for Next.js 15
    const params = Promise.resolve({ lang: "en" as Locale })
    const result = await AboutPage({ params })
    render(result)

    // Check for minimalist container (h-screen w-screen)
    const wrapper = screen.getByTestId("about-page-wrapper")
    expect(wrapper).toHaveClass(
      "h-screen",
      "w-screen",
      "bg-background",
      "overflow-hidden"
    )

    // Language switcher should NOT be in the about page anymore
    expect(screen.queryByTestId("language-switcher")).not.toBeInTheDocument()

    // Check for main content sections
    expect(screen.getByText(dict.about.title)).toBeInTheDocument()
    expect(screen.getByText(dict.about.howItWorks)).toBeInTheDocument()
    expect(screen.getByText(dict.about.opensource)).toBeInTheDocument()

    // The back link
    const backLink = screen.getByRole("link", {
      name: new RegExp(dict.about.backToMap, "i"),
    })
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveClass("text-muted-foreground")
  })
})
