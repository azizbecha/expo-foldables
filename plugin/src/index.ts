import {
  AndroidConfig,
  type ConfigPlugin,
  createRunOncePlugin,
  IOSConfig,
  WarningAggregator,
  withAndroidManifest,
  withAppDelegate,
  withInfoPlist,
} from 'expo/config-plugins';

import { mergeConfigChanges } from './configChanges';
import {
  addSceneManifest,
  adoptSceneLifecycle,
  isSceneDelegateAvailable,
  type SceneLifecycleResult,
} from './sceneLifecycle';

const pkg: { name: string; version: string } = require('../../package.json');

/** Options for the `expo-foldables` config plugin. */
export type ExpoFoldablesPluginProps = {
  /**
   * Adopt the UIScene life cycle on iOS, which apps built with the iOS 27.1 SDK require to launch.
   * Disable it if your app already sets up scenes in a custom way.
   * @default true
   */
  enableSceneLifecycle?: boolean;
};

const WARNING_TAG = 'expo-foldables';

function readSceneLifecycleResult(projectRoot: string): SceneLifecycleResult | undefined {
  try {
    const appDelegate = IOSConfig.Paths.getAppDelegate(projectRoot);
    return appDelegate.language === 'swift' ? adoptSceneLifecycle(appDelegate.contents) : undefined;
  } catch {
    return undefined;
  }
}

const withSceneLifecycle: ConfigPlugin = (config) => {
  config = withAppDelegate(config, (config) => {
    if (!isSceneDelegateAvailable(config.modRequest.projectRoot)) {
      WarningAggregator.addWarningIOS(
        WARNING_TAG,
        'Skipped the UIScene life cycle: it needs ExpoAppSceneDelegate from Expo SDK 57 or later. ' +
          'Apps built with the iOS 27.1 SDK will fail to launch without it.'
      );
      return config;
    }
    if (config.modResults.language !== 'swift') {
      WarningAggregator.addWarningIOS(
        WARNING_TAG,
        'Skipped the UIScene life cycle: only a Swift AppDelegate is supported. Adopt ' +
          'ExpoAppSceneDelegate manually, or set enableSceneLifecycle: false.'
      );
      return config;
    }
    const result = adoptSceneLifecycle(config.modResults.contents);
    if (result.status === 'adopted') {
      config.modResults.contents = result.contents;
    } else if (result.status === 'unrecognized') {
      WarningAggregator.addWarningIOS(
        WARNING_TAG,
        'Skipped the UIScene life cycle: AppDelegate.swift does not match the Expo template, so it ' +
          'was left unchanged. Adopt ExpoAppSceneDelegate manually, or set enableSceneLifecycle: false.'
      );
    }
    return config;
  });

  config = withInfoPlist(config, (config) => {
    const { projectRoot } = config.modRequest;
    // Only declare the scene delegate when the AppDelegate side can be adopted too; a manifest
    // pointing at a missing SceneDelegate class would crash at launch.
    const result = readSceneLifecycleResult(projectRoot);
    if (
      isSceneDelegateAvailable(projectRoot) &&
      result !== undefined &&
      result.status !== 'unrecognized'
    ) {
      config.modResults = addSceneManifest(config.modResults) as typeof config.modResults;
    }
    return config;
  });

  return config;
};

const withFoldConfigChanges: ConfigPlugin = (config) =>
  withAndroidManifest(config, (config) => {
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(config.modResults);
    mainActivity.$['android:configChanges'] = mergeConfigChanges(
      mainActivity.$['android:configChanges']
    );
    return config;
  });

const withExpoFoldables: ConfigPlugin<ExpoFoldablesPluginProps | void> = (config, props) => {
  const { enableSceneLifecycle = true } = props ?? {};
  if (enableSceneLifecycle) {
    config = withSceneLifecycle(config);
  }
  return withFoldConfigChanges(config);
};

export default createRunOncePlugin(withExpoFoldables, pkg.name, pkg.version);
