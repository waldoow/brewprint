import { Header } from '@/components/ui/Header';
import { ThemedScrollView } from '@/components/ui/ThemedScrollView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GrindersService, type Grinder } from '@/lib/services/grinders';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { toast } from 'sonner-native';
import * as Haptics from 'expo-haptics';

export default function GrinderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const [grinder, setGrinder] = useState<Grinder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadGrinder();
    }
  }, [id]);

  const loadGrinder = async () => {
    try {
      const result = await GrindersService.getGrinderById(id!);
      if (result.success && result.data) {
        setGrinder(result.data);
      } else {
        toast.error('Failed to load grinder details');
        router.back();
      }
    } catch (error) {
      console.error('Error loading grinder:', error);
      toast.error('Failed to load grinder details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue without feedback
    }
    router.push(`/grinders/edit/${id}`);
  };

  const handleDelete = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available, continue without feedback
    }
    
    Alert.alert(
      "Delete Grinder",
      "Are you sure you want to delete this grinder? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    if (!grinder) return;
    
    try {
      const result = await GrindersService.deleteGrinder(grinder.id);
      if (result.success) {
        toast.success('Grinder deleted successfully');
        router.back();
      } else {
        toast.error(result.error || 'Failed to delete grinder');
      }
    } catch (error) {
      console.error('Error deleting grinder:', error);
      toast.error('Failed to delete grinder');
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <Header 
          title="Grinder Details"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ThemedText style={{ color: colors.textSecondary }}>
            Loading grinder details...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!grinder) {
    return (
      <ThemedView style={styles.container}>
        <Header 
          title="Grinder Details"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <ThemedText style={{ color: colors.textSecondary }}>
            Grinder not found
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header 
        title={grinder.name}
        subtitle={`${grinder.brand} ${grinder.model}`}
        showBackButton={true}
        onBackPress={() => router.back()}
        rightAction={{
          icon: 'ellipsis-horizontal',
          onPress: () => console.log('More options pressed')
        }}
      />

      <ThemedScrollView style={styles.scrollView}>
        <ThemedView style={styles.content}>
          {/* Basic Info Card */}
          <ThemedView style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              Basic Information
            </ThemedText>
            
            <View style={styles.infoRow}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                Type
              </ThemedText>
              <ThemedText style={[styles.value, { color: colors.text }]}>
                {grinder.type.charAt(0).toUpperCase() + grinder.type.slice(1)}
              </ThemedText>
            </View>

            {grinder.burr_type && (
              <View style={styles.infoRow}>
                <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                  Burr Type
                </ThemedText>
                <ThemedText style={[styles.value, { color: colors.text }]}>
                  {grinder.burr_type.charAt(0).toUpperCase() + grinder.burr_type.slice(1)}
                </ThemedText>
              </View>
            )}

            {grinder.burr_material && (
              <View style={styles.infoRow}>
                <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                  Burr Material
                </ThemedText>
                <ThemedText style={[styles.value, { color: colors.text }]}>
                  {grinder.burr_material.charAt(0).toUpperCase() + grinder.burr_material.slice(1).replace('-', ' ')}
                </ThemedText>
              </View>
            )}

            {grinder.default_setting && (
              <View style={styles.infoRow}>
                <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                  Default Setting
                </ThemedText>
                <ThemedText style={[styles.value, { color: colors.text }]}>
                  {grinder.default_setting}
                </ThemedText>
              </View>
            )}

            {grinder.setting_range && (
              <View style={styles.infoRow}>
                <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                  Setting Range
                </ThemedText>
                <ThemedText style={[styles.value, { color: colors.text }]}>
                  {grinder.setting_range.min} - {grinder.setting_range.max}
                </ThemedText>
              </View>
            )}
          </ThemedView>

          {/* Maintenance Card */}
          {(grinder.last_cleaned || grinder.cleaning_frequency) && (
            <ThemedView style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
                Maintenance
              </ThemedText>
              
              {grinder.last_cleaned && (
                <View style={styles.infoRow}>
                  <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                    Last Cleaned
                  </ThemedText>
                  <ThemedText style={[styles.value, { color: colors.text }]}>
                    {new Date(grinder.last_cleaned).toLocaleDateString()}
                  </ThemedText>
                </View>
              )}

              {grinder.cleaning_frequency && (
                <View style={styles.infoRow}>
                  <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                    Cleaning Frequency
                  </ThemedText>
                  <ThemedText style={[styles.value, { color: colors.text }]}>
                    Every {grinder.cleaning_frequency} days
                  </ThemedText>
                </View>
              )}
            </ThemedView>
          )}

          {/* Notes Card */}
          {grinder.notes && (
            <ThemedView style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
                Notes
              </ThemedText>
              <ThemedText style={[styles.notesText, { color: colors.textSecondary }]}>
                {grinder.notes}
              </ThemedText>
            </ThemedView>
          )}

          {/* Action Buttons */}
          <ThemedView style={styles.actions} noBackground>
            <ThemedButton
              title="Edit Grinder"
              onPress={handleEdit}
              style={styles.actionButton}
            />
            
            <ThemedButton
              title="Delete Grinder"
              variant="destructive"
              onPress={handleDelete}
              style={styles.actionButton}
            />
          </ThemedView>
        </ThemedView>
      </ThemedScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  cardTitle: {
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});