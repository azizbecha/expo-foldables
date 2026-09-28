import { afterEach, describe, expect, it, vi } from 'vitest';

import { Hinge } from '../Hinge';
import { fakeHingeModule } from './expoStub';
import { bookState } from './fixtures';

afterEach(() => fakeHingeModule.reset());

describe('Hinge.getState', () => {
  it('returns undefined when the device has no hinge', () => {
    expect(Hinge.getState()).toBeUndefined();
  });

  it('returns the native state', () => {
    fakeHingeModule.state = bookState;
    expect(Hinge.getState()).toEqual(bookState);
  });
});

describe('Hinge availability', () => {
  it('reads availability from native on every access', () => {
    expect(Hinge.isAvailable).toBe(false);
    fakeHingeModule.isAvailable = true;
    fakeHingeModule.isAngleAvailable = true;
    expect(Hinge.isAvailable).toBe(true);
    expect(Hinge.isAngleAvailable).toBe(true);
  });
});

describe('Hinge.addOnStateChangeListener', () => {
  it('delivers state and maps a missing hinge to undefined', () => {
    const listener = vi.fn();
    Hinge.addOnStateChangeListener(listener);

    fakeHingeModule.emit('onStateChange', { state: bookState });
    fakeHingeModule.emit('onStateChange', { state: null });

    expect(listener.mock.calls).toEqual([[bookState], [undefined]]);
  });

  it('stops delivering after remove, and remove is idempotent', () => {
    const listener = vi.fn();
    const subscription = Hinge.addOnStateChangeListener(listener);

    subscription.remove();
    subscription.remove();
    fakeHingeModule.emit('onStateChange', { state: bookState });

    expect(listener).not.toHaveBeenCalled();
    expect(fakeHingeModule.listenerCount('onStateChange')).toBe(0);
  });
});

describe('Hinge.addOnAngleChangeListener', () => {
  it('throws when the angle is not available', () => {
    expect(() => Hinge.addOnAngleChangeListener(() => {})).toThrow(/Hinge.isAngleAvailable/);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects minDeltaDegrees = %s',
    (minDeltaDegrees) => {
      fakeHingeModule.isAngleAvailable = true;
      expect(() => Hinge.addOnAngleChangeListener(() => {}, { minDeltaDegrees })).toThrow(
        RangeError
      );
    }
  );

  it('delivers every angle by default', () => {
    fakeHingeModule.isAngleAvailable = true;
    const listener = vi.fn();
    Hinge.addOnAngleChangeListener(listener);

    for (const angleDegrees of [90, 90.1, 90.2]) {
      fakeHingeModule.emit('onAngleChange', { angleDegrees });
    }

    expect(listener.mock.calls).toEqual([[90], [90.1], [90.2]]);
  });

  it('skips changes smaller than minDeltaDegrees, measured from the last delivered angle', () => {
    fakeHingeModule.isAngleAvailable = true;
    const listener = vi.fn();
    Hinge.addOnAngleChangeListener(listener, { minDeltaDegrees: 1 });

    for (const angleDegrees of [90, 90.5, 90.9, 91, 91.5, 89.9]) {
      fakeHingeModule.emit('onAngleChange', { angleDegrees });
    }

    expect(listener.mock.calls).toEqual([[90], [91], [89.9]]);
  });

  it('filters independently per listener', () => {
    fakeHingeModule.isAngleAvailable = true;
    const coarse = vi.fn();
    const fine = vi.fn();
    Hinge.addOnAngleChangeListener(coarse, { minDeltaDegrees: 10 });
    Hinge.addOnAngleChangeListener(fine);

    fakeHingeModule.emit('onAngleChange', { angleDegrees: 90 });
    fakeHingeModule.emit('onAngleChange', { angleDegrees: 95 });

    expect(coarse).toHaveBeenCalledTimes(1);
    expect(fine).toHaveBeenCalledTimes(2);
  });
});
