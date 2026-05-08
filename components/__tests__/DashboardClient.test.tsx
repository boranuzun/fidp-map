import { render, screen, fireEvent } from "@testing-library/react"
import DashboardClient from "../DashboardClient"
import { vi, describe, it, expect } from "vitest"
import { type Property } from "../PropertyMap"
import dict from "../../dictionaries/en.json"

// Mock PropertyMap for testing
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
    render(<DashboardClient initialProperties={mockProperties} dict={dict} />);

    // 1. Set some filters
    const searchInput = screen.getByPlaceholderText(dict.dashboard.searchPlaceholder);
    fireEvent.change(searchInput, { target: { value: 'Property A' } });
    
    // Verify search filtered results
    expect(screen.queryByText('Property A')).toBeInTheDocument();
    expect(screen.queryByText('Property B')).not.toBeInTheDocument();

    // Open filters panel
    const filtersToggle = screen.getByLabelText(/toggle filters/i);
    fireEvent.click(filtersToggle);

    // Toggle "Group by Localité"
    const groupBySwitch = screen.getByLabelText(dict.dashboard.groupByLocalite);
    fireEvent.click(groupBySwitch);
    expect(groupBySwitch).toHaveAttribute('aria-checked', 'true');

    // 2. Click RESET FILTERS
    const resetButton = screen.getByRole('button', { name: new RegExp(dict.dashboard.resetFilters, 'i') });
    fireEvent.click(resetButton);

    // 3. Verify everything is reset
    expect(searchInput).toHaveValue('');
    expect(screen.queryByText('Property B')).toBeInTheDocument();
    expect(groupBySwitch).toHaveAttribute('aria-checked', 'false');
    
    // Verify multi-selects are reset (they show "ALL [Label]" when all options are selected)
    expect(screen.getByText(dict.dashboard.allLocalites)).toBeInTheDocument();
    expect(screen.getByText(dict.dashboard.allFondations)).toBeInTheDocument();
  });

  it('renders a full-viewport relative container for the map foundation', () => {
    const { container } = render(<DashboardClient initialProperties={mockProperties} dict={dict} />);
    
    // The main area should be a relative container
    const relativeContainer = container.firstChild as HTMLElement;
    expect(relativeContainer).toHaveClass('relative', 'h-screen', 'w-screen', 'overflow-hidden');
    
    // The map (main) should be the foundation (absolute inset-0)
    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('absolute');
    expect(mainElement).toHaveClass('inset-0');
    expect(relativeContainer).toContainElement(mainElement);
    
    // The sidebar (aside) should be positioned on top (md:absolute)
    const asideElement = screen.getByRole('complementary');
    expect(asideElement).toHaveClass('md:absolute');
    expect(asideElement).toHaveClass('md:top-4');
    expect(asideElement).toHaveClass('md:left-4');
    expect(asideElement).toHaveClass('md:bottom-4');
    expect(relativeContainer).toContainElement(asideElement);
  });

  it('renders a locale-aware "About" link', () => {
    render(<DashboardClient initialProperties={mockProperties} dict={dict} />);
    const aboutLink = screen.getByTitle(dict.common.about);
    expect(aboutLink).toHaveAttribute('href', '/en/about');
  });
});
