import type { HingeState } from './HingeState';

/**
 * Represents how far a foldable device's hinge is open. Mirrors Apple's `UIHinge.Status`.
 *
 * - `closed`: folded shut. The app is running on the cover display, if the device has one.
 * - `partially-open`: folded to an angle between closed and fully open, such as "book" or "tent" postures.
 * - `fully-open`: unfolded flat.
 * - `unknown`: the device has a hinge, but the platform cannot currently report its posture.
 *
 * @see {@linkcode HingeState.posture}
 */
export type HingePosture = 'closed' | 'partially-open' | 'fully-open' | 'unknown';
