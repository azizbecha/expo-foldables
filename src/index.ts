// Reexport the native module. On web, it will be resolved to ExpoHingeModule.web.ts
// and on native platforms to ExpoHingeModule.ts
export { default } from './ExpoHingeModule';
export * from './ExpoHinge.types';
