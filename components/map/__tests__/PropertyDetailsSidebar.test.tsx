import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import React from "react"
import PropertyDetailsSidebar from "../PropertyDetailsSidebar"

describe("PropertyDetailsSidebar", () => {
  const mockProperty = {
    id: 1,
    name: "Test Property",
    address: "123 Test St",
    localite: "Geneva",
    fondation: "Test Fondation",
    units: 5,
    images: ["test1.jpg"],
    url: "https://example.com",
    scraped_at: "2024-01-01",
  }

  const mockDict = {
    details: {
      locationDetails: "Location Details",
      fullAddress: "Full Address",
      localite: "Localite",
      units: "Units",
      mgmtHistory: "Management & History",
      fondation: "Fondation",
      notAvailable: "N/A",
      unknown: "Unknown",
      noPhoto: "No photo",
      builtIn: "Built in {year}",
      tags: "Tags",
      escToClose: "ESC to close",
    },
    dashboard: {
      visitSite: "Visit Site",
    },
  }

  const mockOnClose = vi.fn()
  const mockOnOpenFullScreen = vi.fn()

  it("renders property details when property is provided", () => {
    render(
      <PropertyDetailsSidebar
        property={mockProperty}
        dict={mockDict}
        onClose={mockOnClose}
        onOpenFullScreen={mockOnOpenFullScreen}
      />
    )

    expect(screen.getByText("Test Property")).toBeInTheDocument()
    // The close button should be present. We'll give it an aria-label "Close".
    expect(screen.getByLabelText(/close/i)).toBeInTheDocument()
  })

  it("calls onClose when close button is clicked", () => {
    render(
      <PropertyDetailsSidebar
        property={mockProperty}
        dict={mockDict}
        onClose={mockOnClose}
        onOpenFullScreen={mockOnOpenFullScreen}
      />
    )

    const closeButton = screen.getByLabelText(/close/i)
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it("does not render anything if property is null", () => {
    const { container } = render(
      <PropertyDetailsSidebar
        property={null}
        dict={mockDict}
        onClose={mockOnClose}
        onOpenFullScreen={mockOnOpenFullScreen}
      />
    )

    expect(container.firstChild).toBeNull()
  })
})
