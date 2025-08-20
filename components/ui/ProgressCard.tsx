import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ProgressCardProps {
  title: string;
  subtitle?: string;
  itemsInStock: number;
  awaitingStock: number;
  demand: number;
  priority?: number;
  featured?: boolean;
  onPress?: () => void;
}

export function ProgressCard({
  title,
  subtitle,
  itemsInStock,
  awaitingStock,
  demand,
  priority,
  featured = false,
  onPress
}: ProgressCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const total = itemsInStock + awaitingStock;
  const progress = total > 0 ? (itemsInStock / total) : 0;

  const CardWrapper = featured ? LinearGradient : View;
  const cardProps = featured ? {
    colors: [colors.gradientStart, colors.gradientEnd],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    style: [styles.card, styles.featuredCard]
  } : {
    style: [styles.card, { backgroundColor: colors.cardBackground }]
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <CardWrapper {...cardProps}>
        {/* Header */}
        <View style={styles.header}>
          {priority && (
            <View style={[styles.priorityBadge, { backgroundColor: colors.statusGreen }]}>
              <ThemedText style={styles.priorityText}>{priority}</ThemedText>
            </View>
          )}
          <View style={styles.titleContainer}>
            <ThemedText type="subtitle" style={[styles.title, featured && styles.featuredText]}>
              {title}
            </ThemedText>
            {subtitle && (
              <ThemedText style={[styles.subtitle, featured && styles.featuredSubtext]}>
                {subtitle}
              </ThemedText>
            )}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, { backgroundColor: featured ? 'rgba(255,255,255,0.2)' : colors.progressTrack }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progress * 100}%`,
                  backgroundColor: featured ? colors.progressActive : colors.progressActive
                }
              ]} 
            />
          </View>
          {/* Progress dots */}
          <View style={styles.progressDots}>
            {Array.from({ length: 8 }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: i < (progress * 8) 
                      ? (featured ? colors.progressActive : colors.progressActive)
                      : (featured ? 'rgba(255,255,255,0.3)' : colors.progressTrack)
                  }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statLabel, featured && styles.featuredSubtext]}>
              Beans in stock
            </ThemedText>
            <ThemedText style={[styles.statValue, featured && styles.featuredText]}>
              ~ {itemsInStock}g
            </ThemedText>
          </View>

          <View style={styles.statItem}>
            <ThemedText style={[styles.statLabel, featured && styles.featuredSubtext]}>
              Currently brewing
            </ThemedText>
            <ThemedText style={[styles.statValue, featured && styles.featuredText]}>
              ~ {awaitingStock}g
            </ThemedText>
          </View>

          <View style={styles.statItem}>
            <ThemedText style={[styles.statLabel, featured && styles.featuredSubtext]}>
              Brews planned
            </ThemedText>
            <ThemedText style={[styles.statValue, featured && styles.featuredText]}>
              ~ {demand}
            </ThemedText>
          </View>
        </View>
      </CardWrapper>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  featuredCard: {
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  priorityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  featuredText: {
    color: '#ffffff',
  },
  featuredSubtext: {
    color: 'rgba(255,255,255,0.8)',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});