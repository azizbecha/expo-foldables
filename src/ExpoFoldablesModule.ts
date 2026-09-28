import { NativeModule, requireNativeModule } from 'expo';

import type { Hinge } from './Hinge';
import type { HingeState } from './HingeState';
import { getNativeModuleOverride } from './nativeModuleOverride';

/** Events emitted by the native module. Internal: the public API is {@linkcode Hinge}. */
export type ExpoFoldablesModuleEvents = {
  /** Sent when posture or fold geometry changes. `state` is `null` when the device has no hinge. */
  onStateChange: (event: { state: HingeState | null }) => void;
  /** Sent when the hinge angle changes. Only observed on devices where `isAngleAvailable` is `true`. */
  onAngleChange: (event: { angleDegrees: number }) => void;
};

export declare class ExpoFoldablesModule extends NativeModule<ExpoFoldablesModuleEvents> {
  readonly isAvailable: boolean;
  readonly isAngleAvailable: boolean;
  getState(): HingeState | null;
  /** Latest angle reading, or `null` before the first one. */
  getAngleDegrees(): number | null;
}

let nativeModule: ExpoFoldablesModule | undefined;

/**
 * Returns the native module, resolved on first use and cached. Tests can replace it with
 * `installHingeMock()` from `expo-foldables/testing`.
 */
export default function getExpoFoldablesModule(): ExpoFoldablesModule {
  const override = getNativeModuleOverride();
  if (override !== undefined) {
    return override;
  }
  if (nativeModule === undefined) {
    nativeModule = requireNativeModule<ExpoFoldablesModule>('ExpoFoldables');
  }
  return nativeModule;
}
