import { describe, expect, it } from 'vitest';

import { degreesToRadians, radiansToDegrees } from '../angleConversion';

describe('angle conversion', () => {
  it('converts degrees to radians', () => {
    expect(degreesToRadians(0)).toBe(0);
    expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
    expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
  });

  it('converts radians to degrees', () => {
    expect(radiansToDegrees(0)).toBe(0);
    expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90);
    expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
  });

  it('round-trips', () => {
    for (const degrees of [-45, 0, 12.5, 135, 360]) {
      expect(radiansToDegrees(degreesToRadians(degrees))).toBeCloseTo(degrees);
    }
  });
});
