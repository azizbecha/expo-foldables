import type { Fold } from './Fold';

/**
 * Represents a rectangle in window coordinates, measured in density-independent points
 * (the same unit React Native uses for layout).
 *
 * @see {@linkcode Fold.bounds}
 */
export interface Rect {
  /** Distance from the left edge of the window. */
  readonly x: number;
  /** Distance from the top edge of the window. */
  readonly y: number;
  /** Width of the rectangle. */
  readonly width: number;
  /** Height of the rectangle. */
  readonly height: number;
}
