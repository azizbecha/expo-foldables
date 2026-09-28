import type { Fold } from './Fold';
import type { Hinge } from './Hinge';
import type { HingePosture } from './HingePosture';
import type { useHinge } from './useHinge';

/**
 * Represents the current state of a foldable device's hinge.
 *
 * Returned by {@linkcode Hinge.getState} and {@linkcode useHinge}, and delivered to
 * {@linkcode Hinge.addOnStateChangeListener}. The continuous hinge angle is delivered separately by
 * {@linkcode Hinge.addOnAngleChangeListener} because it changes much more often.
 */
export interface HingeState {
  /** How far the hinge is open. */
  readonly posture: HingePosture;
  /**
   * Where the fold crosses the app window. `undefined` when the fold does not cross the window, for
   * example when the device is closed and the app is on the cover display.
   */
  readonly fold?: Fold;
}
