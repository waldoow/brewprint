import { StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function LibraryScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#8B4513', dark: '#654321' }}
      headerImage={
        <IconSymbol
          size={250}
          color="rgba(255,255,255,0.3)"
          name="books.vertical.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Coffee Library</ThemedText>
        <IconSymbol size={32} name="books.vertical.fill" />
      </ThemedView>
      
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Recipe Collection</ThemedText>
        <ThemedText>
          Browse and organize all your coffee recipes, from espresso shots to pour-over methods.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Bean Database</ThemedText>
        <ThemedText>
          Track your coffee beans with origin details, tasting notes, and brewing recommendations.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Equipment Profiles</ThemedText>
        <ThemedText>
          Manage your grinder settings, brewing equipment, and calibration data.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Brewing Templates</ThemedText>
        <ThemedText>
          Access popular brewing method templates and create your own starter recipes.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -50,
    left: 50,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionContainer: {
    gap: 8,
    marginBottom: 16,
  },
});