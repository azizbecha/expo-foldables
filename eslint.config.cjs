const { defineConfig } = require('eslint/config');
const universe = require('eslint-config-universe/flat/native');
const universeWeb = require('eslint-config-universe/flat/web');

module.exports = defineConfig([
  { ignores: ['build'] },
  ...universe,
  ...universeWeb,
  {
    // Type imports referenced only from JSDoc {@linkcode} look unused to ESLint. tsc's
    // noUnusedLocals understands JSDoc references, so it owns unused-variable checks.
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: { '@typescript-eslint/no-unused-vars': 'off' },
  },
]);
