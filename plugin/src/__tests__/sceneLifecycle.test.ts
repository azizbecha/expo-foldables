import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

import { addSceneManifest, adoptSceneLifecycle } from '../sceneLifecycle';

// The AppDelegate.swift shipped by expo-template-bare-minimum for SDK 57.
const template = fs.readFileSync(path.join(__dirname, 'fixtures/AppDelegate.sdk57.swift'), 'utf8');

describe('adoptSceneLifecycle', () => {
  it('adopts ExpoAppSceneDelegate in the SDK 57 template', () => {
    const result = adoptSceneLifecycle(template);
    expect(result.status).toBe('adopted');
    if (result.status !== 'adopted') return;

    expect(result.contents).toContain(
      'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {'
    );
    expect(result.contents).toContain('class SceneDelegate: ExpoAppSceneDelegate {}');
    // The scene delegate owns the window now.
    expect(result.contents).not.toContain('window = UIWindow(frame: UIScreen.main.bounds)');
    expect(result.contents).not.toContain('factory.startReactNative(');
    // The factory is still created for the scene delegate to use.
    expect(result.contents).toContain('reactNativeFactory = factory');
  });

  it('is idempotent', () => {
    const first = adoptSceneLifecycle(template);
    if (first.status !== 'adopted') throw new Error('expected adopted');
    expect(adoptSceneLifecycle(first.contents)).toEqual({ status: 'already-adopted' });
  });

  it('leaves apps that already use scenes alone', () => {
    const custom = template + '\nclass MyScene: UIResponder, UIWindowSceneDelegate {}\n';
    expect(adoptSceneLifecycle(custom)).toEqual({ status: 'already-adopted' });
  });

  it('reports customized AppDelegates instead of guessing', () => {
    const customized = template.replace('window = UIWindow(frame: UIScreen.main.bounds)', '');
    const result = adoptSceneLifecycle(customized);
    expect(result.status).toBe('unrecognized');
  });
});

describe('addSceneManifest', () => {
  it('declares SceneDelegate for the application role', () => {
    const plist = addSceneManifest({ CFBundleName: 'App' });
    expect(plist.CFBundleName).toBe('App');
    expect(plist.UIApplicationSceneManifest).toEqual({
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    });
  });

  it('keeps an existing scene manifest', () => {
    const existing = { UIApplicationSceneManifest: { UIApplicationSupportsMultipleScenes: true } };
    expect(addSceneManifest(existing)).toBe(existing);
  });
});
