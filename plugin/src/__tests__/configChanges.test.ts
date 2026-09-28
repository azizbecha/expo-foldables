import { describe, expect, it } from 'vitest';

import { mergeConfigChanges } from '../configChanges';

describe('mergeConfigChanges', () => {
  it('keeps the SDK 57 template value unchanged', () => {
    const template =
      'keyboard|keyboardHidden|orientation|screenSize|screenLayout|uiMode|smallestScreenSize|assetsPaths';
    expect(mergeConfigChanges(template)).toBe(template);
  });

  it('adds missing fold-related changes and keeps existing ones', () => {
    expect(mergeConfigChanges('keyboard|orientation')).toBe(
      'keyboard|orientation|screenLayout|screenSize|smallestScreenSize'
    );
  });

  it('handles a missing attribute', () => {
    expect(mergeConfigChanges(undefined)).toBe(
      'orientation|screenLayout|screenSize|smallestScreenSize'
    );
  });
});
