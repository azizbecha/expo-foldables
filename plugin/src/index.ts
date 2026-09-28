import {
  AndroidConfig,
  type ConfigPlugin,
  createRunOncePlugin,
  WarningAggregator,
  withAndroidManifest,
  withInfoPlist,
} from 'expo/config-plugins';

import { mergeConfigChanges } from './configChanges';
import { isSceneSupportMissing, readExpoSdkMajorVersion } from './sceneSupport';

const pkg: { name: string; version: string } = require('../../package.json');

// Checked during the iOS Info.plist mod so the warning only appears when prebuilding for iOS.
const withSceneSupportCheck: ConfigPlugin = (config) =>
  withInfoPlist(config, (config) => {
    const sdkMajorVersion = readExpoSdkMajorVersion(config.modRequest.projectRoot);
    if (isSceneSupportMissing(sdkMajorVersion, config.plugins)) {
      WarningAggregator.addWarningIOS(
        'expo-foldables',
        'Apps built with the iOS 27.1 SDK, which expo-foldables requires, fail at launch unless they adopt ' +
          'the UIScene life cycle. On Expo SDK 57, add ["expo-build-properties", { "ios": ' +
          '{ "enableSceneSupport": true } }] to your plugins. Expo SDK 58 does this by default.'
      );
    }
    return config;
  });

const withFoldConfigChanges: ConfigPlugin = (config) =>
  withAndroidManifest(config, (config) => {
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(config.modResults);
    mainActivity.$['android:configChanges'] = mergeConfigChanges(
      mainActivity.$['android:configChanges']
    );
    return config;
  });

const withExpoFoldables: ConfigPlugin = (config) =>
  withFoldConfigChanges(withSceneSupportCheck(config));

export default createRunOncePlugin(withExpoFoldables, pkg.name, pkg.version);
