# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

- Config plugin (`"plugins": ["expo-foldables"]`): makes sure folding doesn't restart the Android activity, and warns during iOS prebuild when an Expo SDK 57 app hasn't enabled scene support (`expo-build-properties` `ios.enableSceneSupport`), which the iOS 27.1 SDK requires.
- Test utilities: `installHingeMock()` from `expo-foldables/testing` simulates a foldable in Jest or Vitest, and `jest-expo` now mocks the native module automatically as a device without a hinge.

### 🐛 Bug fixes

### 💡 Others

## 0.1.0 — 2026-09-28

First release.

### 🎉 New features

- `Hinge` API: `isAvailable`, `isAngleAvailable`, `getState()`, `addOnStateChangeListener()`, `addOnAngleChangeListener()`.
- `useHinge()` and `useHingeAngle()` hooks.
- `degreesToRadians()` and `radiansToDegrees()` helpers.
- iOS support for iPhone Duo through `UIHingeInteraction` and reserved regions (iOS 27.1 SDK).
- Android support through Jetpack WindowManager `FoldingFeature` and the hinge angle sensor.
