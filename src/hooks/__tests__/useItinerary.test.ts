import { renderHook, act } from '@testing-library/react';
import { useItinerary } from '../useItinerary';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock hooks
vi.mock('@/hooks/useWaitTimes', () => ({
  useWaitTimes: () => ({
    liveData: [
      { id: 'ride-1', queue: { STANDBY: { waitTime: 15 } } },
      { id: 'ride-2', queue: { STANDBY: { waitTime: 30 } } },
      { id: 'ride-3', status: 'DOWN', queue: { STANDBY: { waitTime: 0 } } },
    ]
  })
}));

describe('useItinerary', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should add an item', () => {
    const { result } = renderHook(() => useItinerary('DLR'));
    
    act(() => {
      result.current.addItem('ride-1');
    });

    expect(result.current.itinerary).toHaveLength(1);
    expect(result.current.itinerary[0].rideId).toBe('ride-1');
    expect(result.current.itinerary[0].completed).toBe(false);
  });
});
