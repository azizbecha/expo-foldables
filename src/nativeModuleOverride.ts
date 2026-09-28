import type { ExpoFoldablesModule } from './ExpoFoldablesModule';

// Lets `installHingeMock()` from `expo-foldables/testing` swap in a simulated native module. Kept free
// of `expo` imports so the testing entry doesn't depend on the native runtime.
let override: ExpoFoldablesModule | undefined;

export function getNativeModuleOverride(): ExpoFoldablesModule | undefined {
  return override;
}

export function setNativeModuleOverride(module: ExpoFoldablesModule | undefined): void {
  override = module;
}
