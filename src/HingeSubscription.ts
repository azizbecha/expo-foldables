import type { Hinge } from './Hinge';

/**
 * Represents an active listener registered with {@linkcode Hinge.addOnStateChangeListener} or
 * {@linkcode Hinge.addOnAngleChangeListener}.
 */
export interface HingeSubscription {
  /** Stops delivering updates to the listener. Safe to call more than once. */
  remove(): void;
}
