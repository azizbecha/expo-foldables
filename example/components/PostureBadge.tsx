import type { HingePosture } from 'expo-foldables';
import { StyleSheet, Text, View } from 'react-native';

import { postureColors, postureLabels } from '../theme';

export function PostureBadge({ posture }: { posture: HingePosture }) {
  const color = postureColors[posture];
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{postureLabels[posture]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 15, fontWeight: '600' },
});
