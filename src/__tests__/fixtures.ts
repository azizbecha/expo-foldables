import type { HingeState } from '../HingeState';

export const bookState: HingeState = {
  posture: 'partially-open',
  fold: {
    bounds: { x: 420, y: 0, width: 0, height: 880 },
    orientation: 'vertical',
    isSeparating: true,
    occlusion: 'none',
  },
};

export const flatState: HingeState = {
  posture: 'fully-open',
  fold: { ...bookState.fold!, isSeparating: false },
};

export const closedState: HingeState = { posture: 'closed' };
