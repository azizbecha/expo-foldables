import { degreesToRadians, type HingeState } from 'expo-foldables';
import { StyleSheet, Text, View } from 'react-native';

import { colors, postureColors } from '../theme';
import { HingeDiagram } from './HingeDiagram';
import { PostureBadge } from './PostureBadge';

type Props = {
  hinge: HingeState | undefined;
  angleDegrees: number | undefined;
};

export function HingeHero({ hinge, angleDegrees }: Props) {
  if (hinge === undefined) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>expo-foldables</Text>
        <Text style={styles.empty}>No hinge detected on this device.</Text>
      </View>
    );
  }

  const color = postureColors[hinge.posture];
  return (
    <View style={styles.container}>
      <Text style={styles.title}>expo-foldables</Text>
      <PostureBadge posture={hinge.posture} />
      <View style={styles.diagram}>
        <HingeDiagram angleDegrees={angleDegrees ?? 180} color={color} />
      </View>
      {angleDegrees === undefined ? (
        <Text style={styles.angle}>—</Text>
      ) : (
        <>
          <Text style={styles.angle}>{`${Math.round(angleDegrees)}°`}</Text>
          <Text style={styles.radians}>{`${degreesToRadians(angleDegrees).toFixed(3)} rad`}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, alignItems: 'center' },
  title: { color: colors.muted, fontSize: 15, fontWeight: '600', letterSpacing: 1 },
  empty: { color: colors.text, fontSize: 20, textAlign: 'center' },
  diagram: { marginTop: 8 },
  angle: {
    color: colors.text,
    fontSize: 72,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  radians: {
    color: colors.muted,
    fontSize: 17,
    fontVariant: ['tabular-nums'],
    marginTop: -12,
  },
});
