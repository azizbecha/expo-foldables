import { registerWebModule, NativeModule } from 'expo';

import { ExpoHingeModuleEvents } from './ExpoHinge.types';

// ExpoHingeModule is not available on the web platform.
class ExpoHingeModule extends NativeModule<ExpoHingeModuleEvents> {}

export default registerWebModule(ExpoHingeModule, 'ExpoHingeModule');
