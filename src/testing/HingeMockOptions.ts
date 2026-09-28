import type { HingeState } from '../HingeState';
import type { installHingeMock } from './installHingeMock';

/**
 * Initial device state for {@linkcode installHingeMock}. Omitted fields simulate a device without a
 * hinge.
 */
export interface HingeMockOptions {
  /** Initial hinge state. Omit to simulate a device without a hinge. */
  readonly state?: HingeState;
  /** Initial hinge angle in degrees. Omit to simulate a device that can't report its angle. */
  readonly angleDegrees?: number;
}
