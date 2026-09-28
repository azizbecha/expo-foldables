import type { Fold } from 'expo-foldables';
import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';

/** Marks where the fold crosses the window. Positioned in window coordinates, like `fold.bounds`. */
export function FoldOverlay({ fold }: { fold: Fold }) {
  const { x, y, width, height } = fold.bounds;
  const isVertical = fold.orientation === 'vertical';
  // Folds reported as a line have zero width or height; give them a visible thickness.
  const minThickness = 2;
  const frame = isVertical
    ? {
        left: x + width / 2 - Math.max(width, minThickness) / 2,
        top: y,
        width: Math.max(width, minThickness),
        height,
      }
    : {
        left: x,
        top: y + height / 2 - Math.max(height, minThickness) / 2,
        width,
        height: Math.max(height, minThickness),
      };

  return (
    <View pointerEvents="none" style={[styles.fold, frame]}>
      <View style={[styles.line, isVertical ? styles.lineVertical : styles.lineHorizontal]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fold: {
    position: 'absolute',
    backgroundColor: colors.foldFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { position: 'absolute', backgroundColor: colors.foldLine },
  lineVertical: { width: 1, top: 0, bottom: 0 },
  lineHorizontal: { height: 1, left: 0, right: 0 },
});
