import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Hinge } from '../Hinge';
import type { HingeState } from '../HingeState';
import { installHingeMock, type HingeMock } from '../testing';
import { useHinge } from '../useHinge';
import { useHingeAngle } from '../useHingeAngle';

const book: HingeState = {
  posture: 'partially-open',
  fold: {
    bounds: { x: 420, y: 0, width: 0, height: 880 },
    orientation: 'vertical',
    isSeparating: true,
    occlusion: 'none',
  },
};

let hinge: HingeMock;

beforeEach(() => {
  hinge = installHingeMock();
});

afterEach(() => {
  cleanup();
  hinge.uninstall();
});

describe('installHingeMock', () => {
  it('simulates a device without a hinge by default', () => {
    expect(Hinge.isAvailable).toBe(false);
    expect(Hinge.isAngleAvailable).toBe(false);
    expect(Hinge.getState()).toBeUndefined();
  });

  it('applies initial options', () => {
    hinge.uninstall();
    hinge = installHingeMock({ state: book, angleDegrees: 120 });
    expect(Hinge.isAvailable).toBe(true);
    expect(Hinge.isAngleAvailable).toBe(true);
    expect(Hinge.getState()).toEqual(book);
  });

  it('notifies state listeners', () => {
    const listener = vi.fn();
    Hinge.addOnStateChangeListener(listener);
    hinge.setState(book);
    hinge.setState(undefined);
    expect(listener.mock.calls).toEqual([[book], [undefined]]);
    expect(Hinge.isAvailable).toBe(false);
  });

  it('drives useHinge', () => {
    const { result } = renderHook(() => useHinge());
    expect(result.current).toBeUndefined();
    act(() => hinge.setState(book));
    expect(result.current).toEqual(book);
  });

  it('drives useHingeAngle, including the initial angle', () => {
    hinge.uninstall();
    hinge = installHingeMock({ state: { posture: 'fully-open' }, angleDegrees: 180 });
    const { result } = renderHook(() => useHingeAngle());
    expect(result.current).toBe(180);
    act(() => hinge.setAngleDegrees(95));
    expect(result.current).toBe(95);
  });

  it('makes the angle unavailable when set to undefined', () => {
    hinge.setAngleDegrees(90);
    expect(Hinge.isAngleAvailable).toBe(true);
    hinge.setAngleDegrees(undefined);
    expect(Hinge.isAngleAvailable).toBe(false);
  });

  it('reset returns to a device without a hinge and drops listeners', () => {
    hinge.setState(book);
    const listener = vi.fn();
    Hinge.addOnStateChangeListener(listener);
    hinge.reset();
    hinge.setState(book);
    expect(listener).not.toHaveBeenCalled();
    expect(Hinge.getState()).toEqual(book);
  });

  it('uninstall restores the previous module', () => {
    hinge.setState(book);
    hinge.uninstall();
    // Falls back to the environment's module (the Vitest stub here, which has no hinge).
    expect(Hinge.getState()).toBeUndefined();
    hinge = installHingeMock();
  });
});
