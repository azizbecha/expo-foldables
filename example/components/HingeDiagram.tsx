import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';

type Props = {
  /** 0 is folded shut, 180 is flat. */
  angleDegrees: number;
  color: string;
  panelLength?: number;
};

const THICKNESS = 10;

/**
 * Side view of a foldable: a fixed base panel pointing right and a lid rotating around the hinge.
 * At 0° the lid lies on the base; at 180° it points left, flat.
 */
export function HingeDiagram({ angleDegrees, color, panelLength = 110 }: Props) {
  return (
    <View style={{ width: panelLength * 2 + THICKNESS, height: panelLength + THICKNESS * 2 }}>
      <View style={[styles.hinge, { left: panelLength + THICKNESS / 2, bottom: THICKNESS }]}>
        <View style={[styles.panel, { width: panelLength, backgroundColor: colors.border }]} />
        <View
          style={[
            styles.panel,
            {
              width: panelLength,
              backgroundColor: color,
              transform: [{ rotate: `${-angleDegrees}deg` }],
            },
          ]}
        />
        <View style={[styles.pin, { borderColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hinge: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: -THICKNESS / 2,
    height: THICKNESS,
    borderRadius: THICKNESS / 2,
    transformOrigin: 'left center',
  },
  pin: {
    position: 'absolute',
    left: -THICKNESS,
    top: -THICKNESS,
    width: THICKNESS * 2,
    height: THICKNESS * 2,
    borderRadius: THICKNESS,
    borderWidth: 3,
    backgroundColor: colors.background,
  },
});
