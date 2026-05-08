import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import LanguageSwitcher from '../ui/language-switcher';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/en/about',
}));

// Mock PointerEvent which is not in JSDOM but used by Radix UI
if (typeof window !== 'undefined' && !window.PointerEvent) {
  class PointerEvent extends MouseEvent {
    constructor(type: string, params: MouseEventInit = {}) {
      super(type, params);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.PointerEvent = PointerEvent as any;
}

describe('LanguageSwitcher', () => {
  const mockDict = {
    common: {
      french: 'Français',
      english: 'English',
      german: 'Deutsch',
      italian: 'Italiano',
      language: 'Language',
    }
  };

  it('renders correctly with current language', () => {
    render(<LanguageSwitcher dict={mockDict} currentLang="en" />);
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('opens menu and changes language when an option is clicked', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher dict={mockDict} currentLang="en" />);
    
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    
    // Radix dropdown content is rendered in a portal
    const frOption = await screen.findByText('Français');
    await user.click(frOption);
    
    expect(mockPush).toHaveBeenCalledWith('/fr/about');
  });

  it('allows switching to German', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher dict={mockDict} currentLang="en" />);
    
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    
    const deOption = await screen.findByText('Deutsch');
    await user.click(deOption);
    
    expect(mockPush).toHaveBeenCalledWith('/de/about');
  });
});
