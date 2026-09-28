// Apps built with the iOS 27.1 SDK must adopt the UIScene life cycle or they fail at launch with
// "UIScene life cycle is required for apps built with this SDK". Expo 57 ships ExpoAppSceneDelegate
// for this, but the SDK 57 app template does not wire it up yet. This plugin does:
//   1. AppDelegate conforms to ExpoReactNativeFactoryProvider and no longer creates the window.
//   2. A SceneDelegate subclassing ExpoAppSceneDelegate creates the window and starts React Native.
//   3. Info.plist declares the scene manifest pointing at SceneDelegate.
const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

const WINDOW_SETUP = `#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif
`;

const SCENE_DELEGATE = `
// Added by plugins/withSceneLifecycle.js
class SceneDelegate: ExpoAppSceneDelegate {}
`;

function withSceneAppDelegate(config) {
  return withAppDelegate(config, (config) => {
    if (config.modResults.language !== 'swift') {
      throw new Error('withSceneLifecycle only supports a Swift AppDelegate.');
    }
    let contents = config.modResults.contents;
    if (contents.includes('class SceneDelegate')) {
      return config;
    }
    const replacements = [
      [
        'class AppDelegate: ExpoAppDelegate {',
        'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {',
      ],
      // The scene delegate creates the window and starts React Native.
      [WINDOW_SETUP, ''],
    ];
    for (const [search, replacement] of replacements) {
      if (!contents.includes(search)) {
        throw new Error(
          `withSceneLifecycle could not find expected AppDelegate code:\n${search}\n` +
            'The Expo template may have changed; update plugins/withSceneLifecycle.js.'
        );
      }
      contents = contents.replace(search, replacement);
    }
    config.modResults.contents = contents + SCENE_DELEGATE;
    return config;
  });
}

function withSceneManifest(config) {
  return withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return config;
  });
}

module.exports = function withSceneLifecycle(config) {
  return withSceneManifest(withSceneAppDelegate(config));
};
