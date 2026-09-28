import { Hinge, degreesToRadians, useHinge, useHingeAngle } from 'expo-hinge';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function App() {
  const hinge = useHinge();
  const angleDegrees = useHingeAngle({ minDeltaDegrees: 1 });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>expo-hinge</Text>
        <Group name="Capabilities">
          <Text>isAvailable: {String(Hinge.isAvailable)}</Text>
          <Text>isAngleAvailable: {String(Hinge.isAngleAvailable)}</Text>
        </Group>
        <Group name="State">
          {hinge === undefined ? (
            <Text>No hinge on this device</Text>
          ) : (
            <>
              <Text>posture: {hinge.posture}</Text>
              <Text>fold: {hinge.fold ? JSON.stringify(hinge.fold, null, 2) : 'none'}</Text>
            </>
          )}
        </Group>
        <Group name="Angle">
          {angleDegrees === undefined ? (
            <Text>No reading</Text>
          ) : (
            <>
              <Text>
                {angleDegrees.toFixed(1)}° / {degreesToRadians(angleDegrees).toFixed(3)} rad
              </Text>
              <View style={[styles.lid, { transform: [{ rotate: `${angleDegrees - 180}deg` }] }]} />
            </>
          )}
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: { fontSize: 30, margin: 20 },
  groupHeader: { fontSize: 20, marginBottom: 20 },
  group: { margin: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20, gap: 8 },
  container: { flex: 1, backgroundColor: '#eee' },
  lid: {
    marginTop: 40,
    alignSelf: 'center' as const,
    width: 120,
    height: 4,
    backgroundColor: '#333',
    transformOrigin: 'left',
  },
};
