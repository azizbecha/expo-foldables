import { NativeModule, requireNativeModule } from 'expo';

import { ExpoHingeModuleEvents } from './ExpoHinge.types';

declare class ExpoHingeModule extends NativeModule<ExpoHingeModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

export default requireNativeModule<ExpoHingeModule>('ExpoHinge');
