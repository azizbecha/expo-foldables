// Folding and unfolding changes the window size and screen layout. Without these entries, Android
// recreates the activity, which restarts the React Native app.
export const FOLD_CONFIG_CHANGES = [
  'orientation',
  'screenLayout',
  'screenSize',
  'smallestScreenSize',
];

/** Adds the configuration changes a fold triggers to an `android:configChanges` value. */
export function mergeConfigChanges(configChanges: string | undefined): string {
  const values = (configChanges ?? '').split('|').filter((value) => value.length > 0);
  for (const value of FOLD_CONFIG_CHANGES) {
    if (!values.includes(value)) {
      values.push(value);
    }
  }
  return values.join('|');
}
