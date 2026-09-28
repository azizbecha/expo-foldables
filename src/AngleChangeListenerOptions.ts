import type { Hinge } from './Hinge';
import type { useHingeAngle } from './useHingeAngle';

/**
 * Options for {@linkcode Hinge.addOnAngleChangeListener} and {@linkcode useHingeAngle}.
 */
export interface AngleChangeListenerOptions {
  /**
   * Smallest change in degrees that triggers a new update. Use it to filter out sensor jitter and to
   * limit re-renders. Must be a finite number greater than or equal to `0`.
   * @default 0
   */
  readonly minDeltaDegrees?: number;
}
