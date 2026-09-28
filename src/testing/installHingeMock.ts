import type { HingeState } from '../HingeState';
import type { HingeMock } from './HingeMock';
import type { HingeMockOptions } from './HingeMockOptions';
import type { ExpoFoldablesModule } from '../ExpoFoldablesModule';
import { getNativeModuleOverride, setNativeModuleOverride } from '../nativeModuleOverride';

type Listener = (event: unknown) => void;

// Mirrors the native module surface that the package reads. Deliberately free of `expo` imports, so
// it works in any test environment.
class FakeExpoFoldablesModule {
  state: HingeState | null = null;
  angleDegrees: number | null = null;
  private readonly listeners = new Map<string, Set<Listener>>();

  get isAvailable(): boolean {
    return this.state !== null;
  }

  get isAngleAvailable(): boolean {
    return this.angleDegrees !== null;
  }

  getState(): HingeState | null {
    return this.state;
  }

  getAngleDegrees(): number | null {
    return this.angleDegrees;
  }

  addListener(eventName: string, listener: Listener): { remove(): void } {
    let listeners = this.listeners.get(eventName);
    if (listeners === undefined) {
      listeners = new Set();
      this.listeners.set(eventName, listeners);
    }
    listeners.add(listener);
    return { remove: () => listeners.delete(listener) };
  }

  emit(eventName: string, event: unknown): void {
    // Copy first, so listeners that unsubscribe during dispatch don't affect this emission.
    for (const listener of [...(this.listeners.get(eventName) ?? [])]) {
      listener(event);
    }
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}

/**
 * Replaces the native hinge module with a simulated one for tests. `Hinge`, `useHinge` and
 * `useHingeAngle` then run their real code against the simulation.
 *
 * Install it in `beforeEach` and call {@linkcode HingeMock.uninstall} in `afterEach`.
 *
 * @example
 * ```tsx
 * import { act, render, screen } from '@testing-library/react-native';
 * import { installHingeMock, type HingeMock } from 'expo-foldables/testing';
 *
 * let hinge: HingeMock;
 * beforeEach(() => {
 *   hinge = installHingeMock({ state: { posture: 'fully-open' }, angleDegrees: 180 });
 * });
 * afterEach(() => hinge.uninstall());
 *
 * it('shows two pages in book posture', async () => {
 *   await render(<Reader />);
 *   await act(async () => {
 *     hinge.setState({
 *       posture: 'partially-open',
 *       fold: {
 *         bounds: { x: 420, y: 0, width: 0, height: 880 },
 *         orientation: 'vertical',
 *         isSeparating: true,
 *         occlusion: 'none',
 *       },
 *     });
 *   });
 *   expect(screen.getByTestId('two-pages')).toBeTruthy();
 * });
 * ```
 */
export function installHingeMock(options: HingeMockOptions = {}): HingeMock {
  const previous = getNativeModuleOverride();
  const fake = new FakeExpoFoldablesModule();
  fake.state = options.state ?? null;
  fake.angleDegrees = options.angleDegrees ?? null;
  // The fake implements every member the package reads; the cast covers NativeModule internals.
  setNativeModuleOverride(fake as unknown as ExpoFoldablesModule);

  return {
    setState(state) {
      fake.state = state ?? null;
      fake.emit('onStateChange', { state: fake.state });
    },
    setAngleDegrees(angleDegrees) {
      fake.angleDegrees = angleDegrees ?? null;
      if (angleDegrees !== undefined) {
        fake.emit('onAngleChange', { angleDegrees });
      }
    },
    reset() {
      fake.state = null;
      fake.angleDegrees = null;
      fake.removeAllListeners();
    },
    uninstall() {
      fake.removeAllListeners();
      if (getNativeModuleOverride() === (fake as unknown as ExpoFoldablesModule)) {
        setNativeModuleOverride(previous);
      }
    },
  };
}
