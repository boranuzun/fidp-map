import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import React from "react"
import PropertyDetailsView from "../PropertyDetailsView"

describe("PropertyDetailsView", () => {
  const mockProperty = {
    id: 1,
    name: "Test Property",
    address1: "123 Test St",
    address2: "Suite 100",
    localite: "Geneva",
    fondation: "Test Fondation",
    units: 5,
    images: ["test1.jpg", "test2.jpg"],
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
    },
    dashboard: {
      visitSite: "Visit Site",
    },
  }

  const mockOnOpenFullScreen = vi.fn()

  it("renders property details correctly", () => {
    render(
      <PropertyDetailsView
        property={mockProperty}
        dict={mockDict}
        onOpenFullScreen={mockOnOpenFullScreen}
      />
    )

    expect(screen.getByText("Test Property")).toBeInTheDocument()
    expect(screen.getByText("123 Test St")).toBeInTheDocument()
    expect(screen.getByText("Suite 100")).toBeInTheDocument()
    expect(screen.getByText("Geneva")).toBeInTheDocument()
    expect(screen.getByText("Test Fondation")).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument()
    expect(screen.getByText("Visit Site")).toBeInTheDocument()
  })

  it("calls onOpenFullScreen when an image is clicked", () => {
    render(
      <PropertyDetailsView
        property={mockProperty}
        dict={mockDict}
        onOpenFullScreen={mockOnOpenFullScreen}
      />
    )

    // Click the first image in carousel (mocked behavior might be tricky but we'll try)
    const images = screen.getAllByRole("img")
    // Carousel items are images
    fireEvent.click(images[0])

    expect(mockOnOpenFullScreen).toHaveBeenCalled()
  })
})
