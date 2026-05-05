import { render, screen, fireEvent } from '@testing-library/react';
import { MultiSelectCombobox } from '../ui/multi-select-combobox';
import { MapPin } from 'lucide-react';
import { vi, describe, it, expect } from 'vitest';

describe('MultiSelectCombobox', () => {
  const options = ['Option 1', 'Option 2'];
  const onChange = vi.fn();

  it('selects all items when "[ SELECT ALL ]" is clicked', () => {
    render(
      <MultiSelectCombobox
        options={options}
        selected={[]}
        onChange={onChange}
        placeholder="TEST"
        allLabel="ALL"
        icon={MapPin}
      />
    );
    
    // Open popover
    fireEvent.click(screen.getByText('NONE SELECTED'));
    
    const selectAll = screen.getByText('[ SELECT ALL ]');
    fireEvent.click(selectAll);
    expect(onChange).toHaveBeenCalledWith(options);
  });

  it('clears all items when "[ CLEAR ALL ]" is clicked', () => {
    render(
      <MultiSelectCombobox
        options={options}
        selected={options}
        onChange={onChange}
        placeholder="TEST"
        allLabel="ALL"
        icon={MapPin}
      />
    );
    
    // Open popover
    fireEvent.click(screen.getByText('ALL'));
    
    const clearAll = screen.getByText('[ CLEAR ALL ]');
    fireEvent.click(clearAll);
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
