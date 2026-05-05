import { render, screen, fireEvent } from "@testing-library/react"
import DashboardClient from "../DashboardClient"
import { vi, describe, it, expect } from "vitest"
import { type Property } from "../PropertyMap"

// Mock PropertyMap to avoid Leaflet issues in JSDOM
vi.mock("../PropertyMap", () => ({
  default: () => (
    <div data-testid="map-mock">
      Map
    </div>
  ),
}))

const mockProperties: Property[] = [
  {
    id: 1,
    name: "Property A",
    address: "Address 1",
    localite: "Localite 1",
    fondation: "Fondation 1",
    units: 10,
    url: "url1",
    scraped_at: "2024-01-01",
  },
  {
    id: 2,
    name: "Property B",
    address: "Address 2",
    localite: "Localite 2",
    fondation: "Fondation 2",
    units: 20,
    url: "url2",
    scraped_at: "2024-01-01",
  },
]

describe('DashboardClient', () => {
  it('resets all filters when clicking RESET FILTERS', async () => {
    render(<DashboardClient initialProperties={mockProperties} />);

    // 1. Set some filters
    const searchInput = screen.getByPlaceholderText('SEARCH PROPERTIES...');
    fireEvent.change(searchInput, { target: { value: 'Property A' } });
    
    // Verify search filtered results
    expect(screen.queryByText('Property A')).toBeInTheDocument();
    expect(screen.queryByText('Property B')).not.toBeInTheDocument();

    // Toggle "Group by Localité"
    const groupBySwitch = screen.getByLabelText('GROUP BY LOCALITÉ');
    fireEvent.click(groupBySwitch);
    expect(groupBySwitch).toHaveAttribute('aria-checked', 'true');

    // 2. Click RESET FILTERS
    const resetButton = screen.getByRole('button', { name: /RESET FILTERS/i });
    fireEvent.click(resetButton);

    // 3. Verify everything is reset
    expect(searchInput).toHaveValue('');
    expect(screen.queryByText('Property B')).toBeInTheDocument();
    expect(groupBySwitch).toHaveAttribute('aria-checked', 'false');
    
    // Verify multi-selects are reset (they show "ALL [Label]" when all options are selected)
    expect(screen.getByText('ALL LOCALITÉS')).toBeInTheDocument();
    expect(screen.getByText('ALL FONDATIONS')).toBeInTheDocument();
  });
});
