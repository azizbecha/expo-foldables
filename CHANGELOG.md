# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

- Config plugin (`"plugins": ["expo-foldables"]`): adopts the UIScene life cycle required by the iOS 27.1 SDK, and makes sure folding doesn't restart the Android activity.

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
