import { NativeModule, requireNativeModule } from 'expo';

import type { Hinge } from './Hinge';
import type { HingeState } from './HingeState';

/** Events emitted by the native module. Internal: the public API is {@linkcode Hinge}. */
export type ExpoHingeModuleEvents = {
  /** Sent when posture or fold geometry changes. `state` is `null` when the device has no hinge. */
  onStateChange: (event: { state: HingeState | null }) => void;
  /** Sent when the hinge angle changes. Only observed on devices where `isAngleAvailable` is `true`. */
  onAngleChange: (event: { angleDegrees: number }) => void;
};

export declare class ExpoHingeModule extends NativeModule<ExpoHingeModuleEvents> {
  readonly isAvailable: boolean;
  readonly isAngleAvailable: boolean;
  getState(): HingeState | null;
}

export default requireNativeModule<ExpoHingeModule>('ExpoHinge');
