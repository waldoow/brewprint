import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedBadge } from '@/components/ui/ThemedBadge';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { Header } from '@/components/ui/Header';
import { ProgressCard } from '@/components/ui/ProgressCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BeansService, type Bean } from '@/lib/services/beans';
import { AnalyticsService } from '@/lib/services/analytics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';

export default function BeanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const [bean, setBean] = useState<Bean | null>(null);
  const [loading, setLoading] = useState(true);
  const [beanUsage, setBeanUsage] = useState<any>(null);

  useEffect(() => {
    loadBeanDetails();
    loadBeanAnalytics();
  }, [id]);

  const loadBeanDetails = async () => {
    if (!id) return;
    
    try {
      const result = await BeansService.getBeanById(id);
      if (result.success && result.data) {
        setBean(result.data);
      } else {
        toast.error('Failed to load bean details');
        router.back();
      }
    } catch (error) {
      console.error('Failed to load bean:', error);
      toast.error('Failed to load bean details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadBeanAnalytics = async () => {
    try {
      const result = await AnalyticsService.getBeanUsage();
      if (result.success && result.data) {
        const usage = result.data.find(u => u.bean_id === id);
        setBeanUsage(usage);
      }
    } catch (error) {
      console.error('Failed to load bean analytics:', error);
    }
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/beans/edit/${id}`);
  };

  const handleDelete = () => {
    if (!bean) return;

    Alert.alert(
      'Delete Bean',
      `Are you sure you want to delete "${bean.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              const result = await BeansService.deleteBean(id!);
              if (result.success) {
                toast.success('Bean deleted successfully');
                router.back();
              } else {
                toast.error(result.error || 'Failed to delete bean');
              }
            } catch (error) {
              toast.error('Failed to delete bean');
            }
          },
        },
      ]
    );
  };

  const handleAddToStock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/beans/add-stock/${id}`);
  };

  const handleUseBean = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/brewprints/new?bean_id=${id}`);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Bean Details" onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ThemedText>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!bean) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Bean Details" onBack={() => router.back()} />
        <View style={styles.errorContainer}>
          <ThemedText>Bean not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const freshnessDays = bean.roast_date ? 
    Math.floor((new Date().getTime() - new Date(bean.roast_date).getTime()) / (1000 * 60 * 60 * 24)) : 
    null;

  const freshnessStatus = freshnessDays === null ? 'unknown' :
    freshnessDays <= 7 ? 'peak' :
    freshnessDays <= 14 ? 'good' :
    freshnessDays <= 21 ? 'fading' : 'stale';

  const freshnessColor = {
    peak: colors.statusGreen,
    good: colors.statusGreen,
    fading: colors.statusYellow,
    stale: colors.statusRed,
    unknown: colors.textSecondary
  }[freshnessStatus];

  // Calculate advanced metrics
  const costPer100g = bean.price && bean.weight_grams ? 
    ((bean.price / bean.weight_grams) * 100).toFixed(2) : null;
  
  const remainingPercentage = bean.weight_grams && bean.weight_grams > 0 ? 
    Math.max(0, ((bean.weight_grams - (beanUsage?.total_weight_used || 0)) / bean.weight_grams) * 100) : 100;
  
  const estimatedBrewsRemaining = bean.weight_grams && bean.weight_grams > 0 ?
    Math.floor((bean.weight_grams - (beanUsage?.total_weight_used || 0)) / 15) : 0; // Assuming 15g per brew
  
  const roastDate = bean.roast_date ? new Date(bean.roast_date) : null;

  return (
    <ThemedView style={styles.container}>
      <Header 
        title="BEAN ANALYSIS"
        subtitle={`${bean.name} • ${bean.roaster || 'Independent Roaster'}`}
        onBack={() => router.back()}
        rightAction={{
          icon: 'edit',
          onPress: handleEdit
        }}
        showTopSpacing={true}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Primary Specifications Card */}
        <View style={[styles.specificationsCard, { 
          backgroundColor: colors.cardBackground,
          borderLeftColor: freshnessColor,
        }]}>
          <View style={styles.specHeader}>
            <View style={styles.specMain}>
              <ThemedText style={[styles.specTitle, { color: colors.text }]}>
                COFFEE SPECIFICATIONS
              </ThemedText>
              <ThemedText style={[styles.specStatus, { color: freshnessColor }]}>
                {freshnessStatus.toUpperCase()}
              </ThemedText>
            </View>
          </View>
          
          {/* Technical specifications grid */}
          <View style={styles.specificationsGrid}>
            <View style={styles.specificationRow}>
              <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                ORIGIN
              </ThemedText>
              <ThemedText style={[styles.specValue, { color: colors.text }]}>
                {bean.origin || 'Unknown Region'}
              </ThemedText>
            </View>
            
            <View style={styles.specificationRow}>
              <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                PROCESS
              </ThemedText>
              <ThemedText style={[styles.specValue, { color: colors.text }]}>
                {bean.process || 'Unknown Process'}
              </ThemedText>
            </View>
            
            <View style={styles.specificationRow}>
              <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                ROAST LEVEL
              </ThemedText>
              <ThemedText style={[styles.specValue, { color: colors.text }]}>
                {bean.roast_level ? bean.roast_level.charAt(0).toUpperCase() + bean.roast_level.slice(1).replace('-', ' ') : 'Unspecified'}
              </ThemedText>
            </View>
            
            <View style={styles.specificationRow}>
              <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                VARIETY
              </ThemedText>
              <ThemedText style={[styles.specValue, { color: colors.text }]}>
                {bean.variety || 'Mixed/Unknown'}
              </ThemedText>
            </View>

            {bean.altitude && (
              <View style={styles.specificationRow}>
                <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                  ALTITUDE
                </ThemedText>
                <ThemedText style={[styles.specValue, { color: colors.text }]}>
                  {bean.altitude}m ASL
                </ThemedText>
              </View>
            )}
          </View>

          {/* Primary analytics row */}
          <View style={styles.primaryAnalyticsRow}>
            <View style={styles.analyticsItem}>
              <ThemedText style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
                DAYS POST-ROAST
              </ThemedText>
              <ThemedText style={[styles.analyticsValue, { color: colors.text }]}>
                {freshnessDays !== null ? freshnessDays : '∞'}
              </ThemedText>
            </View>
            
            <View style={styles.analyticsItem}>
              <ThemedText style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
                ROAST DATE
              </ThemedText>
              <ThemedText style={[styles.analyticsValue, { color: colors.text }]}>
                {roastDate ? roastDate.toLocaleDateString() : 'Unknown'}
              </ThemedText>
            </View>
            
            <View style={styles.analyticsItem}>
              <ThemedText style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
                INITIAL WEIGHT
              </ThemedText>
              <ThemedText style={[styles.analyticsValue, { color: colors.text }]}>
                {bean.weight_grams || 0}g
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Cost Analysis Card */}
        <View style={[styles.costCard, { 
          backgroundColor: colors.cardBackground,
          borderLeftColor: colors.primary,
        }]}>
          <View style={styles.cardHeader}>
            <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
              COST ANALYSIS
            </ThemedText>
          </View>
          
          <View style={styles.costGrid}>
            <View style={styles.costRow}>
              <ThemedText style={[styles.costLabel, { color: colors.textSecondary }]}>
                PURCHASE PRICE
              </ThemedText>
              <ThemedText style={[styles.costValue, { color: colors.text }]}>
                ${bean.price ? bean.price.toFixed(2) : '0.00'}
              </ThemedText>
            </View>
            
            {costPer100g && (
              <View style={styles.costRow}>
                <ThemedText style={[styles.costLabel, { color: colors.textSecondary }]}>
                  COST/100G
                </ThemedText>
                <ThemedText style={[styles.costValue, { color: colors.text }]}>
                  ${costPer100g}
                </ThemedText>
              </View>
            )}
            
            <View style={styles.costRow}>
              <ThemedText style={[styles.costLabel, { color: colors.textSecondary }]}>
                REMAINING
              </ThemedText>
              <ThemedText style={[styles.costValue, { color: colors.text }]}>
                {remainingPercentage.toFixed(0)}% ({(bean.weight_grams || 0) - (beanUsage?.total_weight_used || 0)}g)
              </ThemedText>
            </View>
            
            <View style={styles.costRow}>
              <ThemedText style={[styles.costLabel, { color: colors.textSecondary }]}>
                EST. BREWS LEFT
              </ThemedText>
              <ThemedText style={[styles.costValue, { color: colors.text }]}>
                {estimatedBrewsRemaining} @ 15g/brew
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Brewing Performance Card */}
        {beanUsage && (
          <View style={[styles.performanceCard, { 
            backgroundColor: colors.cardBackground,
            borderLeftColor: colors.statusGreen,
          }]}>
            <View style={styles.cardHeader}>
              <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
                BREWING PERFORMANCE
              </ThemedText>
              <ThemedText style={[styles.sessionCount, { color: colors.textSecondary }]}>
                {beanUsage.usage_count} SESSION{beanUsage.usage_count === 1 ? '' : 'S'}
              </ThemedText>
            </View>
            
            <View style={styles.performanceGrid}>
              <View style={styles.performanceRow}>
                <ThemedText style={[styles.performanceLabel, { color: colors.textSecondary }]}>
                  AVG RATING
                </ThemedText>
                <ThemedText style={[styles.performanceValue, { color: colors.text }]}>
                  {beanUsage.average_rating ? beanUsage.average_rating.toFixed(1) : 'N/A'}/10
                </ThemedText>
              </View>
              
              <View style={styles.performanceRow}>
                <ThemedText style={[styles.performanceLabel, { color: colors.textSecondary }]}>
                  TOTAL CONSUMED
                </ThemedText>
                <ThemedText style={[styles.performanceValue, { color: colors.text }]}>
                  {beanUsage.total_weight_used || 0}g
                </ThemedText>
              </View>
              
              <View style={styles.performanceRow}>
                <ThemedText style={[styles.performanceLabel, { color: colors.textSecondary }]}>
                  AVG PER BREW
                </ThemedText>
                <ThemedText style={[styles.performanceValue, { color: colors.text }]}>
                  {beanUsage.usage_count > 0 ? 
                    ((beanUsage.total_weight_used || 0) / beanUsage.usage_count).toFixed(1) + 'g' : 
                    'N/A'
                  }
                </ThemedText>
              </View>
              
              <View style={styles.performanceRow}>
                <ThemedText style={[styles.performanceLabel, { color: colors.textSecondary }]}>
                  UTILIZATION
                </ThemedText>
                <ThemedText style={[styles.performanceValue, { color: colors.text }]}>
                  {bean.weight_grams && bean.weight_grams > 0 ? 
                    (((beanUsage.total_weight_used || 0) / bean.weight_grams) * 100).toFixed(1) + '%' : 
                    '0.0%'
                  }
                </ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Tasting Profile Card */}
        {bean.notes && (
          <View style={[styles.tastingCard, { 
            backgroundColor: colors.cardBackground,
            borderLeftColor: colors.statusYellow,
          }]}>
            <View style={styles.cardHeader}>
              <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
                TASTING PROFILE
              </ThemedText>
            </View>
            
            <View style={styles.tastingContent}>
              <ThemedText style={[styles.tastingNotes, { color: colors.text }]}>
                {bean.notes}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Professional Action Panel */}
        <View style={[styles.actionPanel, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.actionHeader}>
            <ThemedText style={[styles.actionTitle, { color: colors.text }]}>
              BEAN OPERATIONS
            </ThemedText>
          </View>
          
          <View style={styles.actionGrid}>
            <ThemedButton
              onPress={handleUseBean}
              variant="default"
              size="default"
              style={styles.primaryOperation}
            >
              CREATE RECIPE
            </ThemedButton>
            
            <ThemedButton
              onPress={handleEdit}
              variant="secondary"
              size="default"
              style={styles.secondaryOperation}
            >
              MODIFY SPECS
            </ThemedButton>
            
            <ThemedButton
              onPress={handleAddToStock}
              variant="secondary"
              size="default"
              style={styles.secondaryOperation}
            >
              UPDATE STOCK
            </ThemedButton>
            
            <ThemedButton
              onPress={handleDelete}
              variant="destructive"
              size="default"
              style={styles.destructiveOperation}
            >
              DELETE BEAN
            </ThemedButton>
          </View>
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Advanced specifications card
  specificationsCard: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  specHeader: {
    marginBottom: 12,
  },
  specMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  specStatus: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  // Specifications grid
  specificationsGrid: {
    gap: 8,
    marginBottom: 12,
  },
  specificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
  },
  specValue: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1.5,
  },
  
  // Primary analytics
  primaryAnalyticsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  analyticsItem: {
    flex: 1,
  },
  analyticsLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  analyticsValue: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  
  // Cost analysis card
  costCard: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  costGrid: {
    gap: 8,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
  },
  costValue: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    flex: 1,
  },
  
  // Performance card
  performanceCard: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sessionCount: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  performanceGrid: {
    gap: 8,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
  },
  performanceValue: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    flex: 1,
  },
  
  // Tasting card
  tastingCard: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tastingContent: {
    paddingTop: 8,
  },
  tastingNotes: {
    fontSize: 13,
    lineHeight: 18,
  },
  
  // Action panel
  actionPanel: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionHeader: {
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  actionGrid: {
    gap: 8,
  },
  primaryOperation: {
    marginBottom: 4,
  },
  secondaryOperation: {
    marginBottom: 4,
  },
  destructiveOperation: {
    marginTop: 4,
  },
});