import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        // The real `expo` entry pulls in react-native, which Node cannot parse (Flow syntax).
        // Tests only need the native module surface, so swap in a controllable stub. Exact match
        // only, so subpaths such as `expo/config-plugins` still resolve to the real package.
        find: /^expo$/,
        replacement: fileURLToPath(new URL('./src/__tests__/expoStub.ts', import.meta.url)),
      },
    ],
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/__tests__/**/*.test.{ts,tsx}', 'plugin/src/**/__tests__/**/*.test.ts'],
  },
});
