import { Hinge, type HingeState } from 'expo-foldables';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

function round(value: number): string {
  return String(Math.round(value * 10) / 10);
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function HingeDetails({ hinge }: { hinge: HingeState | undefined }) {
  const fold = hinge?.fold;
  return (
    <View style={styles.container}>
      <Card title="FOLD">
        {fold === undefined ? (
          <Text style={styles.label}>No fold crosses this window.</Text>
        ) : (
          <>
            <Row label="Orientation" value={fold.orientation} />
            <Row label="Separating" value={fold.isSeparating ? 'yes' : 'no'} />
            <Row label="Occlusion" value={fold.occlusion} />
            <Row label="Position" value={`${round(fold.bounds.x)}, ${round(fold.bounds.y)}`} />
            <Row
              label="Size"
              value={`${round(fold.bounds.width)} × ${round(fold.bounds.height)}`}
            />
          </>
        )}
      </Card>
      <Card title="DEVICE">
        <Row label="Hinge" value={Hinge.isAvailable ? 'available' : 'none'} />
        <Row label="Angle sensor" value={Hinge.isAngleAvailable ? 'available' : 'none'} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, width: '100%', maxWidth: 420 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 18,
    gap: 12,
  },
  cardTitle: { color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  label: { color: colors.muted, fontSize: 16 },
  value: { color: colors.text, fontSize: 16, fontVariant: ['tabular-nums'] },
});
