/**
 * Converts an angle from degrees to radians.
 *
 * @example
 * ```ts
 * degreesToRadians(180); // Math.PI
 * ```
 * @see {@linkcode radiansToDegrees}
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts an angle from radians to degrees.
 *
 * @example
 * ```ts
 * radiansToDegrees(Math.PI); // 180
 * ```
 * @see {@linkcode degreesToRadians}
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}
