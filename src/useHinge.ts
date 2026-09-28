import { useSyncExternalStore } from 'react';

import type { Hinge } from './Hinge';
import type { HingeState } from './HingeState';
import { getHingeStateSnapshot, subscribeToHingeState } from './hingeStateStore';

/**
 * Returns the current hinge state and re-renders when the posture or fold geometry changes.
 * Returns `undefined` when the device has no hinge.
 *
 * @example
 * ```tsx
 * function Reader() {
 *   const hinge = useHinge();
 *   const isBook = hinge?.fold?.isSeparating && hinge.fold.orientation === 'vertical';
 *   return isBook ? <TwoPageLayout fold={hinge.fold} /> : <SinglePageLayout />;
 * }
 * ```
 * @see {@linkcode Hinge.addOnStateChangeListener}
 */
export function useHinge(): HingeState | undefined {
  return useSyncExternalStore(subscribeToHingeState, getHingeStateSnapshot);
}
