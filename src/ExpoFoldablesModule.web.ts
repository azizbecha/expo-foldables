import { registerWebModule, NativeModule } from 'expo';

import type { ExpoFoldablesModuleEvents } from './ExpoFoldablesModule';
import type { HingeState } from './HingeState';

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

export default registerWebModule(ExpoFoldablesModule, 'ExpoFoldables');
