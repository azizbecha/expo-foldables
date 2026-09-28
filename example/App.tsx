import { useHinge, useHingeAngle } from 'expo-foldables';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FoldOverlay } from './components/FoldOverlay';
import { HingeDetails } from './components/HingeDetails';
import { HingeHero } from './components/HingeHero';
import { colors, spacing } from './theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <Screen />
    </SafeAreaProvider>
  );
}

function Screen() {
  const hinge = useHinge();
  const angleDegrees = useHingeAngle({ minDeltaDegrees: 0.5 });
  const insets = useSafeAreaInsets();
  const fold = hinge?.fold;

  const hero = <HingeHero hinge={hinge} angleDegrees={angleDegrees} />;
  const details = <HingeDetails hinge={hinge} />;

  let content: React.ReactNode;
  if (fold?.isSeparating && fold.orientation === 'vertical') {
    // Book posture: one pane on each side of the fold, split exactly at the fold bounds.
    content = (
      <View style={styles.row}>
        <View style={[styles.pane, { width: fold.bounds.x, paddingLeft: insets.left + spacing }]}>
          {hero}
        </View>
        <View style={{ width: fold.bounds.width }} />
        <View style={[styles.pane, styles.flex, { paddingRight: insets.right + spacing }]}>
          {details}
        </View>
      </View>
    );
  } else if (fold?.isSeparating && fold.orientation === 'horizontal') {
    // Tabletop posture: hero above the fold, details below it.
    content = (
      <View style={styles.flex}>
        <View style={[styles.pane, { height: fold.bounds.y, paddingTop: insets.top + spacing }]}>
          {hero}
        </View>
        <View style={{ height: fold.bounds.height }} />
        <View style={[styles.pane, styles.flex, { paddingBottom: insets.bottom + spacing }]}>
          {details}
        </View>
      </View>
    );
  } else {
    content = (
      <ScrollView
        contentContainerStyle={[
          styles.column,
          {
            paddingTop: insets.top + spacing,
            paddingBottom: insets.bottom + spacing,
            paddingLeft: insets.left + spacing,
            paddingRight: insets.right + spacing,
          },
        ]}>
        {hero}
        {details}
      </ScrollView>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Only when separating: the fold then falls in the gap between panes, clear of any content. */}
      {fold?.isSeparating && <FoldOverlay fold={fold} />}
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  row: { flex: 1, flexDirection: 'row' },
  pane: { justifyContent: 'center', alignItems: 'center', padding: spacing },
  column: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 40 },
});
