import type { HingeState } from '../HingeState';
import type { installHingeMock } from './installHingeMock';

/**
 * Controls a simulated hinge installed by {@linkcode installHingeMock}. Setters notify listeners
 * synchronously, like the native module does; wrap them in `act()` when testing React components.
 */
export interface HingeMock {
  /**
   * Simulates a hinge state change. Pass `undefined` to simulate a device without a hinge, which also
   * makes `Hinge.isAvailable` `false`.
   */
  setState(state: HingeState | undefined): void;
  /**
   * Simulates a hinge angle reading. Pass `undefined` to simulate a device that can't report its
   * angle, which makes `Hinge.isAngleAvailable` `false`.
   */
  setAngleDegrees(angleDegrees: number | undefined): void;
  /** Returns to a device without a hinge and removes all listeners. */
  reset(): void;
  /** Removes the simulated hinge and restores whatever module was in use before. */
  uninstall(): void;
}
