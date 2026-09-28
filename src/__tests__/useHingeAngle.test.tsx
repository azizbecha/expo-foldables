import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useHingeAngle } from '../useHingeAngle';
import { fakeHingeModule } from './expoStub';

afterEach(() => {
  cleanup();
  fakeHingeModule.reset();
});

describe('useHingeAngle', () => {
  it('returns undefined and does not subscribe when the angle is unavailable', () => {
    const { result } = renderHook(() => useHingeAngle());
    expect(result.current).toBeUndefined();
    expect(fakeHingeModule.listenerCount('onAngleChange')).toBe(0);
  });

  it('returns undefined until the first reading, then tracks the angle', () => {
    fakeHingeModule.isAngleAvailable = true;
    const { result } = renderHook(() => useHingeAngle());
    expect(result.current).toBeUndefined();

    act(() => fakeHingeModule.emit('onAngleChange', { angleDegrees: 120 }));
    expect(result.current).toBe(120);
  });

  it('applies minDeltaDegrees', () => {
    fakeHingeModule.isAngleAvailable = true;
    const { result } = renderHook(() => useHingeAngle({ minDeltaDegrees: 5 }));

    act(() => fakeHingeModule.emit('onAngleChange', { angleDegrees: 100 }));
    act(() => fakeHingeModule.emit('onAngleChange', { angleDegrees: 103 }));
    expect(result.current).toBe(100);

    act(() => fakeHingeModule.emit('onAngleChange', { angleDegrees: 106 }));
    expect(result.current).toBe(106);
  });

  it('resubscribes when minDeltaDegrees changes and cleans up on unmount', () => {
    fakeHingeModule.isAngleAvailable = true;
    const { rerender, unmount } = renderHook(
      ({ minDeltaDegrees }) => useHingeAngle({ minDeltaDegrees }),
      { initialProps: { minDeltaDegrees: 1 } }
    );
    rerender({ minDeltaDegrees: 2 });
    expect(fakeHingeModule.listenerCount('onAngleChange')).toBe(1);

    unmount();
    expect(fakeHingeModule.listenerCount('onAngleChange')).toBe(0);
  });
});

describe('useHingeAngle availability', () => {
  it('subscribes once the hinge is reported after mount', () => {
    const { result } = renderHook(() => useHingeAngle());
    expect(fakeHingeModule.listenerCount('onAngleChange')).toBe(0);

    // Simulates iOS: the first hinge update arrives shortly after launch.
    fakeHingeModule.isAvailable = true;
    fakeHingeModule.isAngleAvailable = true;
    fakeHingeModule.state = { posture: 'partially-open' };
    act(() => fakeHingeModule.emit('onStateChange', { state: { posture: 'partially-open' } }));
    expect(fakeHingeModule.listenerCount('onAngleChange')).toBe(1);

    act(() => fakeHingeModule.emit('onAngleChange', { angleDegrees: 75 }));
    expect(result.current).toBe(75);
  });
});

describe('useHingeAngle initial angle', () => {
  it('shows the current angle on mount without waiting for a change', () => {
    fakeHingeModule.isAngleAvailable = true;
    fakeHingeModule.isAvailable = true;
    fakeHingeModule.angleDegrees = 180;
    const { result } = renderHook(() => useHingeAngle());
    expect(result.current).toBe(180);
  });
});
