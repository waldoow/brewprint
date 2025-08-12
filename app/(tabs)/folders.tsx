import { StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';

export default function FoldersScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#DAA520', dark: '#B8860B' }}
      headerImage={
        <IconSymbol
          size={250}
          color="rgba(255,255,255,0.3)"
          name="folder.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Recipe Folders</ThemedText>
        <IconSymbol size={32} name="folder.fill" />
      </ThemedView>
      
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Custom Collections</ThemedText>
        <ThemedText>
          Organize your recipes into custom folders like "Morning Brews", "Weekend Specials", or "Espresso Blends".
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Brewing Methods</ThemedText>
        <ThemedText>
          Sort recipes by brewing method: V60, Chemex, French Press, AeroPress, and Espresso.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Favorites & Archive</ThemedText>
        <ThemedText>
          Keep your go-to recipes easily accessible and archive experiments you want to revisit.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Shared Collections</ThemedText>
        <ThemedText>
          Discover and save recipe collections shared by the coffee community.
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