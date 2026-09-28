import type { Fold } from './Fold';
import { Hinge } from './Hinge';
import type { HingeState } from './HingeState';
import type { HingeSubscription } from './HingeSubscription';

// External store backing useHinge. useSyncExternalStore requires getSnapshot to return the same
// reference while the state is unchanged, so native snapshots are compared structurally before
// replacing the cached one.

const listeners = new Set<() => void>();
let nativeSubscription: HingeSubscription | undefined;
let snapshot: HingeState | undefined;

function isSameFold(a: Fold | undefined, b: Fold | undefined): boolean {
  if (a === undefined || b === undefined) {
    return a === b;
  }
  return (
    a.orientation === b.orientation &&
    a.isSeparating === b.isSeparating &&
    a.occlusion === b.occlusion &&
    a.bounds.x === b.bounds.x &&
    a.bounds.y === b.bounds.y &&
    a.bounds.width === b.bounds.width &&
    a.bounds.height === b.bounds.height
  );
}

function isSameState(a: HingeState | undefined, b: HingeState | undefined): boolean {
  if (a === undefined || b === undefined) {
    return a === b;
  }
  return a.posture === b.posture && isSameFold(a.fold, b.fold);
}

function update(next: HingeState | undefined): boolean {
  if (isSameState(snapshot, next)) {
    return false;
  }
  snapshot = next;
  return true;
}

export function subscribeToHingeState(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  if (nativeSubscription === undefined) {
    nativeSubscription = Hinge.addOnStateChangeListener((state) => {
      if (update(state)) {
        listeners.forEach((listener) => listener());
      }
    });
    // The state may have changed between the first render and this subscription.
    if (update(Hinge.getState())) {
      onStoreChange();
    }
  }
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0 && nativeSubscription !== undefined) {
      nativeSubscription.remove();
      nativeSubscription = undefined;
    }
  };
}

export function getHingeStateSnapshot(): HingeState | undefined {
  // Without a native subscription the cache can be stale, so read through to native.
  if (nativeSubscription === undefined) {
    update(Hinge.getState());
  }
  return snapshot;
}
