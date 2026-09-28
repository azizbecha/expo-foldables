import { registerWebModule, NativeModule } from 'expo';

import type { ExpoHingeModuleEvents } from './ExpoHingeModule';
import type { HingeState } from './HingeState';

// Browsers do not expose a hinge yet, so the web build behaves like a device without one.
class ExpoHingeModule extends NativeModule<ExpoHingeModuleEvents> {
  readonly isAvailable = false;
  readonly isAngleAvailable = false;

  getState(): HingeState | null {
    return null;
  }
}

export default registerWebModule(ExpoHingeModule, 'ExpoHinge');
