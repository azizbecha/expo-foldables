import type { AngleChangeListenerOptions } from './AngleChangeListenerOptions';
import ExpoFoldablesModule from './ExpoFoldablesModule';
import type { HingeState } from './HingeState';
import type { HingeSubscription } from './HingeSubscription';
import type { degreesToRadians } from './angleConversion';
import type { useHinge } from './useHinge';
import type { useHingeAngle } from './useHingeAngle';

/**
 * Reads the hinge of a foldable device, such as iPhone Duo or an Android foldable.
 *
 * Use {@linkcode Hinge.getState} and {@linkcode Hinge.addOnStateChangeListener} for posture and fold
 * geometry, which drive layout. Use {@linkcode Hinge.addOnAngleChangeListener} for the continuous angle,
 * which drives interactive effects. In React components, prefer {@linkcode useHinge} and
 * {@linkcode useHingeAngle}.
 *
 * @see {@linkcode Hinge}
 */
export interface HingeModule {
  /**
   * Whether the device has a hinge. `false` on non-foldable devices and on web.
   *
   * This can turn `true` shortly after launch, once the platform reports the hinge for the first time.
   * On Android devices without a hinge angle sensor, that happens only when a fold first crosses the app
   * window. Listen with {@linkcode Hinge.addOnStateChangeListener} to be notified.
   */
  readonly isAvailable: boolean;

  /**
   * Whether the device reports the continuous hinge angle.
   * {@linkcode Hinge.addOnAngleChangeListener} throws when this is `false`. Like
   * {@linkcode Hinge.isAvailable}, it can turn `true` shortly after launch.
   */
  readonly isAngleAvailable: boolean;

  /**
   * Returns the current hinge state, or `undefined` when the device has no hinge.
   *
   * @see {@linkcode Hinge.addOnStateChangeListener}
   */
  getState(): HingeState | undefined;

  /**
   * Calls `listener` whenever the hinge posture or fold geometry changes. The listener receives
   * `undefined` if the device stops reporting a hinge.
   *
   * @returns A subscription. Call `remove()` on it to stop listening.
   * @see {@linkcode useHinge}
   */
  addOnStateChangeListener(listener: (state: HingeState | undefined) => void): HingeSubscription;

  /**
   * Calls `listener` with the hinge angle in degrees whenever it changes. `0` means folded shut and `180`
   * means fully open. Use {@linkcode degreesToRadians} to convert.
   *
   * @returns A subscription. Call `remove()` on it to stop listening.
   * @throws When {@linkcode Hinge.isAngleAvailable} is `false`, or when
   * {@linkcode AngleChangeListenerOptions.minDeltaDegrees} is negative or not finite.
   * @see {@linkcode useHingeAngle}
   */
  addOnAngleChangeListener(
    listener: (angleDegrees: number) => void,
    options?: AngleChangeListenerOptions
  ): HingeSubscription;
}

/**
 * Entry point for reading the hinge of a foldable device.
 *
 * @example
 * ```ts
 * if (Hinge.isAvailable) {
 *   const subscription = Hinge.addOnStateChangeListener((state) => {
 *     console.log(state?.posture);
 *   });
 *   // Later:
 *   subscription.remove();
 * }
 * ```
 */
export const Hinge: HingeModule = {
  get isAvailable() {
    return ExpoFoldablesModule.isAvailable;
  },

  get isAngleAvailable() {
    return ExpoFoldablesModule.isAngleAvailable;
  },

  getState() {
    return ExpoFoldablesModule.getState() ?? undefined;
  },

  addOnStateChangeListener(listener) {
    return ExpoFoldablesModule.addListener('onStateChange', ({ state }) => {
      listener(state ?? undefined);
    });
  },

  addOnAngleChangeListener(listener, options = {}) {
    const { minDeltaDegrees = 0 } = options;
    if (!Number.isFinite(minDeltaDegrees) || minDeltaDegrees < 0) {
      throw new RangeError(
        `minDeltaDegrees must be a finite number >= 0, received ${minDeltaDegrees}.`
      );
    }
    if (!ExpoFoldablesModule.isAngleAvailable) {
      throw new Error(
        'The hinge angle is not available on this device. Check Hinge.isAngleAvailable first, ' +
          'or use Hinge.getState() to read the hinge posture instead.'
      );
    }

    let lastAngleDegrees: number | undefined;
    return ExpoFoldablesModule.addListener('onAngleChange', ({ angleDegrees }) => {
      if (
        lastAngleDegrees !== undefined &&
        Math.abs(angleDegrees - lastAngleDegrees) < minDeltaDegrees
      ) {
        return;
      }
      lastAngleDegrees = angleDegrees;
      listener(angleDegrees);
    });
  },
};
