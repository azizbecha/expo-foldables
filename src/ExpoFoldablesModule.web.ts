import { registerWebModule, NativeModule } from 'expo';

import type { ExpoFoldablesModuleEvents } from './ExpoFoldablesModule';
import type { HingeState } from './HingeState';
import { getNativeModuleOverride } from './nativeModuleOverride';

// Browsers do not expose a hinge yet, so the web build behaves like a device without one.
class ExpoFoldablesModule extends NativeModule<ExpoFoldablesModuleEvents> {
  readonly isAvailable = false;
  readonly isAngleAvailable = false;

  getState(): HingeState | null {
    return null;
  }

  getAngleDegrees(): number | null {
    return null;
  }
}

const webModule = registerWebModule(ExpoFoldablesModule, 'ExpoFoldables');

export default function getExpoFoldablesModule() {
  return getNativeModuleOverride() ?? webModule;
}
