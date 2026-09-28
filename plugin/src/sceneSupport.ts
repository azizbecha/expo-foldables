import fs from 'fs';

// Apps built with the iOS 27.1 SDK must adopt the UIScene life cycle or they fail at launch. Expo SDK
// 58 templates adopt it by default; SDK 57 apps opt in through expo-build-properties.

type PluginEntry = string | [string, unknown] | unknown;

/** Whether the app config enables `ios.enableSceneSupport` in expo-build-properties. */
export function hasBuildPropertiesSceneSupport(plugins: PluginEntry[] | undefined): boolean {
  return (plugins ?? []).some((entry) => {
    if (!Array.isArray(entry) || entry[0] !== 'expo-build-properties') {
      return false;
    }
    const props = entry[1] as { ios?: { enableSceneSupport?: unknown } } | undefined;
    return props?.ios?.enableSceneSupport === true;
  });
}

/** Whether an app on this Expo SDK needs the scene support opt-in to launch with the iOS 27.1 SDK. */
export function isSceneSupportMissing(
  sdkMajorVersion: number | undefined,
  plugins: PluginEntry[] | undefined
): boolean {
  if (sdkMajorVersion === undefined || sdkMajorVersion >= 58) {
    return false;
  }
  return !hasBuildPropertiesSceneSupport(plugins);
}

/** Major version of the `expo` package installed in the project, or `undefined` if unknown. */
export function readExpoSdkMajorVersion(projectRoot: string): number | undefined {
  try {
    const packageJsonPath = require.resolve('expo/package.json', { paths: [projectRoot] });
    const { version } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as { version: string };
    const major = Number.parseInt(version, 10);
    return Number.isNaN(major) ? undefined : major;
  } catch {
    return undefined;
  }
}
