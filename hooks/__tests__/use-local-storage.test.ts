import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLocalStorage } from '../use-local-storage';

describe('useLocalStorage', () => {
  const key = 'test-key';
  const initialValue = { name: 'initial' };

  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(key, initialValue));
    expect(result.current[0]).toEqual(initialValue);
  });

  it('should update value and persist to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage(key, initialValue));
    const newValue = { name: 'updated' };

    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toEqual(newValue);
    expect(JSON.parse(window.localStorage.getItem(key)!)).toEqual(newValue);
  });

  it('should initialize with value from localStorage if it exists', () => {
    const existingValue = { name: 'existing' };
    window.localStorage.setItem(key, JSON.stringify(existingValue));

    const { result } = renderHook(() => useLocalStorage(key, initialValue));
    expect(result.current[0]).toEqual(existingValue);
  });

  it('should handle function updates like useState', () => {
    const { result } = renderHook(() => useLocalStorage(key, 0));

    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(window.localStorage.getItem(key)).toBe('1');
  });

  it('should handle errors when reading from localStorage', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    window.localStorage.setItem(key, 'invalid-json');

    const { result } = renderHook(() => useLocalStorage(key, initialValue));
    
    expect(result.current[0]).toEqual(initialValue);
    expect(consoleSpy).toHaveBeenCalled();
  });
});
