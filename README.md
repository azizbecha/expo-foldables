# expo-hinge

Hinge posture, angle, and fold geometry for foldable devices: iPhone Duo and Android foldables.

- **Posture** (`closed`, `partially-open`, `fully-open`, `unknown`) and **fold geometry**, for layout.
- **Continuous angle** in degrees, for interactive effects.
- React hooks on top of a plain imperative API.

## Requirements

| Platform | Requirement                                                                                                    |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| iOS      | **Xcode 27.1 or newer** (iOS 27.1 SDK). Hinge data is available on iPhone Duo running iOS 27.1+.               |
| Android  | Fold geometry and posture on any foldable via Jetpack WindowManager. Angle needs a hinge sensor (Android 11+). |
| Web      | Behaves like a device without a hinge.                                                                         |

> [!WARNING]
> The hinge APIs ship only in the iOS 27.1 SDK. Building with an older Xcode fails with missing `UIHinge`
> symbols. `pod install` prints a warning when it detects an older Xcode.

## Installation

```sh
npx expo install expo-hinge
```

Then rebuild your development client (`npx expo run:ios` / `npx expo run:android`). Expo Go is not supported.

## Usage

### Layout with `useHinge`

```tsx
import { useHinge } from 'expo-hinge';

function Reader() {
  const hinge = useHinge(); // undefined on devices without a hinge

  if (hinge?.fold?.isSeparating && hinge.fold.orientation === 'vertical') {
    // Book posture: keep content off the fold.
    return <TwoPages foldX={hinge.fold.bounds.x} foldWidth={hinge.fold.bounds.width} />;
  }
  return <OnePage />;
}
```

### Effects with `useHingeAngle`

```tsx
import { useHingeAngle } from 'expo-hinge';

function Lid() {
  const angleDegrees = useHingeAngle({ minDeltaDegrees: 1 }); // 0 = shut, 180 = flat
  return <Text>{angleDegrees === undefined ? '-' : `${Math.round(angleDegrees)}°`}</Text>;
}
```

Use posture and fold geometry for layout decisions, and the angle for effects. This matches
Apple's guidance for iPhone Duo.

### Imperative API

```ts
import { Hinge, degreesToRadians } from 'expo-hinge';

if (Hinge.isAvailable) {
  const state = Hinge.getState();

  const stateSubscription = Hinge.addOnStateChangeListener((next) => {
    console.log(next?.posture, next?.fold);
  });

  if (Hinge.isAngleAvailable) {
    const angleSubscription = Hinge.addOnAngleChangeListener(
      (angleDegrees) => console.log(degreesToRadians(angleDegrees)),
      { minDeltaDegrees: 0.5 }
    );
    angleSubscription.remove();
  }

  stateSubscription.remove();
}
```

## API

| Export                                            | Description                                                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `Hinge.isAvailable`                               | Whether the device has a hinge.                                                                      |
| `Hinge.isAngleAvailable`                          | Whether the continuous angle is reported.                                                            |
| `Hinge.getState()`                                | Current `HingeState`, or `undefined` without a hinge.                                                |
| `Hinge.addOnStateChangeListener(listener)`        | Posture/fold updates. Returns a subscription with `remove()`.                                        |
| `Hinge.addOnAngleChangeListener(listener, opts)`  | Angle updates in degrees. Throws when `isAngleAvailable` is `false` or `minDeltaDegrees` is invalid. |
| `useHinge()`                                      | Hook returning `HingeState \| undefined`.                                                            |
| `useHingeAngle(opts)`                             | Hook returning the angle in degrees, or `undefined` before the first reading or when unavailable.    |
| `degreesToRadians(deg)` / `radiansToDegrees(rad)` | Unit conversion. iOS reports radians natively; this library always reports degrees.                  |

```ts
interface HingeState {
  posture: 'closed' | 'partially-open' | 'fully-open' | 'unknown';
  fold?: {
    bounds: { x: number; y: number; width: number; height: number }; // window coordinates, points
    orientation: 'horizontal' | 'vertical';
    isSeparating: boolean;
    occlusion: 'none' | 'full';
  };
}
```

## Platform notes

- **iOS**: posture and angle come from `UIHingeInteraction`. Fold geometry comes from the `.division` reserved
  region. `isSeparating` is `true` while that region is active.
- **Android**: posture and fold geometry come from `FoldingFeature`. When no fold crosses the window (for example on
  the cover display), posture is derived from the hinge sensor: ≤ 10° is `closed`, ≥ 170° is `fully-open`. Without a
  hinge sensor, `isAvailable` becomes `true` only after the first `FoldingFeature` is reported.

## Development

```sh
bun install
bun run lint
bun run typecheck
bun run test      # Vitest
bun run build
```

## Roadmap

- [ ] Reanimated integration: drive a `SharedValue` from the hinge angle on the UI thread.
- [ ] Web support through the Device Posture and Viewport Segments APIs.
- [ ] Build iOS in CI once hosted runners ship Xcode 27.1.
