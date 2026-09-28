import { useEffect, useState } from 'react';

import type { AngleChangeListenerOptions } from './AngleChangeListenerOptions';
import { Hinge } from './Hinge';
import { useHinge } from './useHinge';

/**
 * Returns the hinge angle in degrees and re-renders when it changes. `0` means folded shut and `180`
 * means fully open.
 *
 * Returns `undefined` until the first reading arrives, and always on devices where
 * {@linkcode Hinge.isAngleAvailable} is `false`. Use it for interactive effects, and use
 * {@linkcode useHinge} for layout decisions.
 *
 * @example
 * ```tsx
 * function Lid() {
 *   const angleDegrees = useHingeAngle({ minDeltaDegrees: 1 });
 *   return <Text>{angleDegrees === undefined ? '-' : `${Math.round(angleDegrees)}°`}</Text>;
 * }
 * ```
 * @throws When {@linkcode AngleChangeListenerOptions.minDeltaDegrees} is negative or not finite.
 * @see {@linkcode Hinge.addOnAngleChangeListener}
 */
export function useHingeAngle(options: AngleChangeListenerOptions = {}): number | undefined {
  const { minDeltaDegrees = 0 } = options;
  const [angleDegrees, setAngleDegrees] = useState<number | undefined>(undefined);
  // Availability can turn true after mount, once the platform reports the hinge for the first time.
  const hasHinge = useHinge() !== undefined;

  useEffect(() => {
    if (!Hinge.isAngleAvailable) {
      return undefined;
    }
    const subscription = Hinge.addOnAngleChangeListener(setAngleDegrees, { minDeltaDegrees });
    return () => subscription.remove();
  }, [minDeltaDegrees, hasHinge]);

  return angleDegrees;
}
