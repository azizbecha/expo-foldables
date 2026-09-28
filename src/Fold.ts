import type { HingeState } from './HingeState';
import type { Rect } from './Rect';

/**
 * Represents the direction of a {@linkcode Fold} line relative to the window.
 *
 * - `horizontal`: the fold runs left to right, splitting the window into top and bottom halves.
 * - `vertical`: the fold runs top to bottom, splitting the window into left and right halves.
 *
 * @see {@linkcode Fold.orientation}
 */
export type FoldOrientation = 'horizontal' | 'vertical';

/**
 * Represents how much of a {@linkcode Fold} area hides content.
 *
 * - `none`: the fold area still displays content, as on a continuous folding screen.
 * - `full`: the fold area cannot display content, as with a physical hinge between two screens.
 *
 * @see {@linkcode Fold.occlusion}
 */
export type FoldOcclusion = 'none' | 'full';

/**
 * Represents where a device's fold crosses the app window, for laying out content around it.
 *
 * @see {@linkcode HingeState.fold}
 */
export interface Fold {
  /**
   * Area of the fold in window coordinates. It can have zero width or height when the fold is a line
   * rather than a physical gap.
   */
  readonly bounds: Rect;
  /** Direction of the fold line relative to the window. */
  readonly orientation: FoldOrientation;
  /**
   * Whether the fold visually splits the window into two areas. This is `true` when the device is
   * {@linkcode HingeState.posture | partially open}, or when the fold is a physical gap between two screens.
   * Avoid placing content across the fold when this is `true`.
   */
  readonly isSeparating: boolean;
  /** How much of {@linkcode Fold.bounds} hides content. */
  readonly occlusion: FoldOcclusion;
}
