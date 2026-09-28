import { describe, expect, it } from 'vitest';

import { hasBuildPropertiesSceneSupport, isSceneSupportMissing } from '../sceneSupport';

const optIn = ['expo-build-properties', { ios: { enableSceneSupport: true } }];

describe('hasBuildPropertiesSceneSupport', () => {
  it('detects the expo-build-properties opt-in', () => {
    expect(hasBuildPropertiesSceneSupport(['expo-foldables', optIn])).toBe(true);
  });

  it('ignores other or disabled configurations', () => {
    expect(hasBuildPropertiesSceneSupport(undefined)).toBe(false);
    expect(hasBuildPropertiesSceneSupport(['expo-build-properties'])).toBe(false);
    expect(
      hasBuildPropertiesSceneSupport([
        ['expo-build-properties', { ios: { enableSceneSupport: false } }],
      ])
    ).toBe(false);
    expect(
      hasBuildPropertiesSceneSupport([
        ['expo-build-properties', { android: { minSdkVersion: 26 } }],
      ])
    ).toBe(false);
  });
});

describe('isSceneSupportMissing', () => {
  it('flags SDK 57 apps without the opt-in', () => {
    expect(isSceneSupportMissing(57, ['expo-foldables'])).toBe(true);
  });

  it('accepts SDK 57 apps with the opt-in', () => {
    expect(isSceneSupportMissing(57, [optIn])).toBe(false);
  });

  it('accepts SDK 58 and newer, which adopt scenes by default', () => {
    expect(isSceneSupportMissing(58, [])).toBe(false);
    expect(isSceneSupportMissing(59, undefined)).toBe(false);
  });

  it('does not warn when the SDK version is unknown', () => {
    expect(isSceneSupportMissing(undefined, [])).toBe(false);
  });
});
