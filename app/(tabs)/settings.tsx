import { StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function SettingsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#708090', dark: '#2F4F4F' }}
      headerImage={
        <IconSymbol
          size={250}
          color="rgba(255,255,255,0.3)"
          name="gearshape.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Settings</ThemedText>
        <IconSymbol size={32} name="gearshape.fill" />
      </ThemedView>
      
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Preferences</ThemedText>
        <ThemedText>
          Customize units (grams/ounces), temperature scale, timer settings, and default ratios.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Profile & Sync</ThemedText>
        <ThemedText>
          Manage your account, sync data across devices, and configure backup settings.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Notifications</ThemedText>
        <ThemedText>
          Set up brewing timer alerts, reminders for bean freshness, and community updates.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Data & Privacy</ThemedText>
        <ThemedText>
          Export your brewing data, manage privacy settings, and control data sharing preferences.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">About</ThemedText>
        <ThemedText>
          App version, support resources, community guidelines, and feedback options.
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