import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import React from "react"
import { ModeToggle } from "../ui/mode-toggle"
import userEvent from "@testing-library/user-event"

// Mock next-themes
const mockSetTheme = vi.fn()
vi.mock("next-themes", () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    theme: "light",
  }),
}))

// Mock PointerEvent for Radix UI
if (typeof window !== "undefined" && !window.PointerEvent) {
  class PointerEvent extends MouseEvent {
    constructor(type: string, params: MouseEventInit = {}) {
      super(type, params)
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.PointerEvent = PointerEvent as any
}

describe("ModeToggle", () => {
  beforeEach(() => {
    mockSetTheme.mockClear()
  })

  it("renders the theme toggle button", () => {
    render(<ModeToggle />)
    expect(screen.getByRole("button")).toBeInTheDocument()
    expect(screen.getByText("Toggle theme")).toBeInTheDocument() // sr-only text
  })

  it("opens menu and calls setTheme when an option is clicked", async () => {
    const user = userEvent.setup()
    render(<ModeToggle />)

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    // Check if options are visible
    const darkOption = await screen.findByText("Dark")
    const lightOption = await screen.findByText("Light")
    const systemOption = await screen.findByText("System")

    expect(darkOption).toBeInTheDocument()
    expect(lightOption).toBeInTheDocument()
    expect(systemOption).toBeInTheDocument()

    // Click Dark option
    await user.click(darkOption)
    expect(mockSetTheme).toHaveBeenCalledWith("dark")

    // Click Light option
    await user.click(trigger)
    await user.click(await screen.findByText("Light"))
    expect(mockSetTheme).toHaveBeenCalledWith("light")

    // Click System option
    await user.click(trigger)
    await user.click(await screen.findByText("System"))
    expect(mockSetTheme).toHaveBeenCalledWith("system")
  })
})
