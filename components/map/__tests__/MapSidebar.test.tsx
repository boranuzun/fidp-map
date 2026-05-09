import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import React from "react"
import MapSidebar from "../MapSidebar"

describe("MapSidebar", () => {
  const mockDictionary = {
    dashboard: {
      searchPlaceholder: "SEARCH PROPERTIES...",
      resetFilters: "RESET FILTERS",
    },
    layers: {
      grayscale: "Grayscale",
      color: "Color",
      properties: "Properties",
      buildingLayouts: "Building Layouts",
      style: "Style",
      satellite: "Satellite",
    },
  }

  const mockOnSearch = vi.fn()

  it("renders the sidebar and search input", () => {
    render(
      <MapSidebar
        dictionary={mockDictionary}
        onSearch={mockOnSearch}
        search=""
        onReset={vi.fn()}
        isFiltered={false}
      >
        <div data-testid="child-content">Sidebar Content</div>
      </MapSidebar>
    )

    // Verify glassmorphism container
    const sidebar = screen.getByRole("complementary")
    expect(sidebar).toBeInTheDocument()

    // Check for responsive positioning classes
    expect(sidebar).toHaveClass("fixed")
    expect(sidebar).toHaveClass("inset-x-4")
    expect(sidebar).toHaveClass("bottom-4")
    expect(sidebar).toHaveClass("md:absolute")
    expect(sidebar).toHaveClass("md:top-4")
    expect(sidebar).toHaveClass("md:left-4")
    expect(sidebar).toHaveClass("md:bottom-4")
    expect(sidebar).toHaveClass("md:w-[400px]")

    expect(sidebar).toHaveClass("bg-glass")
    expect(sidebar).toHaveClass("backdrop-blur-md")
    expect(sidebar).toHaveClass("border-glass-border")

    // Verify search input
    const searchInput = screen.getByPlaceholderText("SEARCH PROPERTIES...")
    expect(searchInput).toBeInTheDocument()

    // Verify children content
    expect(screen.getByTestId("child-content")).toBeInTheDocument()
  })

  it("calls onSearch when input changes", () => {
    render(
      <MapSidebar
        dictionary={mockDictionary}
        onSearch={mockOnSearch}
        search=""
        onReset={vi.fn()}
        isFiltered={false}
      >
        <div>Content</div>
      </MapSidebar>
    )

    const searchInput = screen.getByPlaceholderText("SEARCH PROPERTIES...")
    fireEvent.change(searchInput, { target: { value: "Geneva" } })

    expect(mockOnSearch).toHaveBeenCalledWith("Geneva")
  })
})
