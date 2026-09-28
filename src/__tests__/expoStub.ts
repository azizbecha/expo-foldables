import type { HingeState } from '../HingeState';

type Listener = (event: any) => void;

export class NativeModule {
  private readonly listeners = new Map<string, Set<Listener>>();

  addListener(eventName: string, listener: Listener) {
    let set = this.listeners.get(eventName);
    if (set === undefined) {
      set = new Set();
      this.listeners.set(eventName, set);
    }
    set.add(listener);
    return { remove: () => set.delete(listener) };
  }

  emit(eventName: string, event: unknown) {
    this.listeners.get(eventName)?.forEach((listener) => listener(event));
  }

  listenerCount(eventName: string): number {
    return this.listeners.get(eventName)?.size ?? 0;
  }

  removeAllListeners() {
    this.listeners.clear();
  }
}

/** Stands in for the native ExpoFoldables module. Tests mutate it to simulate a device. */
class FakeHingeModule extends NativeModule {
  isAvailable = false;
  isAngleAvailable = false;
  state: HingeState | null = null;
  angleDegrees: number | null = null;

  getState(): HingeState | null {
    // Native returns a fresh object on every call; mimic that so reference stability is tested.
    return this.state === null ? null : structuredClone(this.state);
  }

  getAngleDegrees(): number | null {
    return this.angleDegrees;
  }

  reset() {
    this.isAvailable = false;
    this.isAngleAvailable = false;
    this.state = null;
    this.angleDegrees = null;
    this.removeAllListeners();
  }
}

export const fakeHingeModule = new FakeHingeModule();

export function requireNativeModule() {
  return fakeHingeModule;
}

export function registerWebModule<T>(ModuleClass: new () => T): T {
  return new ModuleClass();
}
