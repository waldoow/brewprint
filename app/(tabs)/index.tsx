import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedBadge } from '@/components/ui/ThemedBadge';
import { Header } from '@/components/ui/Header';
import { ProgressCard } from '@/components/ui/ProgressCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { BeansService, type Bean } from '@/lib/services/beans';
import { BrewprintsService, type Brewprint } from '@/lib/services';
import { AnalyticsService, type BrewingStats } from '@/lib/services/analytics';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user } = useAuth();

  const [beans, setBeans] = useState<Bean[]>([]);
  const [brewprints, setBrewprints] = useState<Brewprint[]>([]);
  const [stats, setStats] = useState<BrewingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [beansResult, brewprintsResult, statsResult] = await Promise.all([
        BeansService.getAllBeans(),
        BrewprintsService.getAllBrewprints(),
        AnalyticsService.getBrewingStats(),
      ]);

      if (beansResult.success && beansResult.data) {
        setBeans(beansResult.data);
      }

      if (brewprintsResult.success && brewprintsResult.data) {
        setBrewprints(brewprintsResult.data);
      }

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Dashboard stats
  const dashboardStats = useMemo(() => {
    const totalBeans = beans.length;
    const totalRecipes = brewprints.length;
    const activeRecipes = brewprints.filter(b => b.status === 'experimenting').length;
    const totalBrews = stats?.total_sessions || 0;

    // Calculate fresh beans (roasted within last 14 days)
    const freshBeans = beans.filter(bean => {
      if (!bean.roast_date) return false;
      const roastDate = new Date(bean.roast_date);
      const daysSinceRoast = Math.floor((new Date().getTime() - roastDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceRoast <= 14;
    }).length;

    // Calculate total inventory weight
    const totalWeight = beans.reduce((sum, bean) => sum + (bean.weight_grams || 0), 0);

    return {
      totalBeans,
      totalRecipes,
      activeRecipes,
      totalBrews,
      freshBeans,
      totalWeight,
    };
  }, [beans, brewprints, stats]);

  // Mock brewprint for display when no real brewprints exist
  const mockBrewprint = {
    id: 'mock-1',
    name: 'Morning V60',
    brewer_type: 'v60',
    status: 'experimenting',
    coffee_dose: 22,
    water_temp: 92,
    total_time: 210, // 3:30 in seconds
    description: 'A bright and balanced morning brew with Ethiopian Yirgacheffe. Notes of citrus and floral undertones.',
  };

  // Use real brewprints or fallback to mock data
  const displayBrewprints = brewprints.length > 0 ? brewprints : [mockBrewprint];

  // Recent beans for quick access
  const recentBeans = useMemo(() => {
    return beans
      .slice(0, 3)
      .map((bean) => {
        const freshnessDays = bean.roast_date ? 
          Math.floor((new Date().getTime() - new Date(bean.roast_date).getTime()) / (1000 * 60 * 60 * 24)) : 
          null;

        const freshnessStatus = freshnessDays === null ? 0 :
          freshnessDays <= 7 ? 1 : // Fresh
          freshnessDays <= 14 ? 2 : // Good
          freshnessDays <= 21 ? 3 : 4; // Stale

        return {
          id: bean.id,
          title: bean.name,
          subtitle: `${bean.roast_level || 'Unknown'} - ${bean.roaster || 'Unknown Roaster'}`,
          itemsInStock: bean.weight_grams || 0,
          awaitingStock: Math.floor((bean.weight_grams || 0) * 0.1),
          demand: freshnessStatus === 4 ? 1 : freshnessStatus === 3 ? 2 : 0,
          priority: freshnessStatus,
          featured: freshnessStatus === 1,
        };
      });
  }, [beans]);

  const handleQuickAction = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (action) {
      case 'new-brew':
        // Navigate to new brewprint
        router.push('/(tabs)/brewprints/new');
        break;
      case 'add-bean':
        router.push('/(tabs)/beans/new');
        break;
      case 'view-recipes':
        router.push('/(tabs)/brewprints');
        break;
      case 'view-beans':
        router.push('/(tabs)/library');
        break;
      default:
        console.log(`Action: ${action}`);
    }
  };

  const handleBeanPress = (beanId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/bean-detail/${beanId}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ThemedView noBackground={false} style={styles.container}>
      <Header 
        title="Dashboard"
        subtitle={`${getGreeting()}, ${user?.email?.split('@')[0] || 'Coffee Lover'}`}
        showBackButton={false}
        showMenuButton={true}
        showProfileAvatar={true}
        showSearchButton={false}
        onMenuPress={() => console.log('Menu pressed')}
        onProfilePress={() => router.push('/(tabs)/settings')}
        showTopSpacing={true}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Analytics Overview */}
        <View style={styles.section}>
          <View style={[styles.analyticsCard, { backgroundColor: colors.cardBackground }]}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              Brewing Analytics
            </ThemedText>
            
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsItem}>
                <ThemedText type="caption" style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
                  Total Sessions
                </ThemedText>
                <ThemedText type="title" style={[styles.analyticsValue, { color: colors.text }]}>
                  {dashboardStats.totalBrews}
                </ThemedText>
              </View>
              
              <View style={styles.analyticsItem}>
                <ThemedText type="caption" style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
                  Avg Quality
                </ThemedText>
                <ThemedText type="title" style={[styles.analyticsValue, { color: colors.text }]}>
                  {stats?.average_quality ? `${(stats.average_quality * 10).toFixed(1)}/10` : '-'}
                </ThemedText>
              </View>
              
              <View style={styles.analyticsItem}>
                <ThemedText type="caption" style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
                  Active Recipes
                </ThemedText>
                <ThemedText type="title" style={[styles.analyticsValue, { color: colors.text }]}>
                  {dashboardStats.activeRecipes}/{dashboardStats.totalRecipes}
                </ThemedText>
              </View>
              
              <View style={styles.analyticsItem}>
                <ThemedText type="caption" style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
                  Inventory
                </ThemedText>
                <ThemedText type="title" style={[styles.analyticsValue, { color: colors.text }]}>
                  {Math.round(dashboardStats.totalWeight)}g
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Brewprint */}
        <View style={styles.section}>
          <View style={styles.cardHeader}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              Latest Brewprint
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/brewprints')}>
              <ThemedText style={[styles.cardAction, { color: colors.primary }]}>
                View All →
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.brewprintCard, { 
              backgroundColor: colors.primary + '20',
              borderColor: colors.primary,
            }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Only navigate to real brewprints, not mock data
              if (brewprints.length > 0) {
                router.push(`/(tabs)/brewprints/${displayBrewprints[0].id}`);
              } else {
                router.push('/(tabs)/brewprints/new');
              }
            }}
          >
            <View style={styles.brewprintHeader}>
              <View style={styles.brewprintMain}>
                <ThemedText type="defaultSemiBold" style={[styles.brewprintName, { color: colors.text }]}>
                  {displayBrewprints[0].name}
                </ThemedText>
                <ThemedText style={[styles.brewprintSubtitle, { color: colors.textSecondary }]}>
                  {displayBrewprints[0].brewer_type ? displayBrewprints[0].brewer_type.charAt(0).toUpperCase() + displayBrewprints[0].brewer_type.slice(1).replace('-', ' ') : 'Unknown Method'}
                </ThemedText>
              </View>
              <View style={styles.brewprintStatus}>
                <ThemedText style={[
                  styles.statusBadge, 
                  { 
                    color: displayBrewprints[0].status === 'perfected' ? colors.statusGreen : 
                           displayBrewprints[0].status === 'experimenting' ? colors.primary : colors.textSecondary,
                    backgroundColor: displayBrewprints[0].status === 'perfected' ? colors.statusGreen + '20' : 
                                   displayBrewprints[0].status === 'experimenting' ? colors.primary + '20' : colors.textSecondary + '20'
                  }
                ]}>
                  {displayBrewprints[0].status ? displayBrewprints[0].status.toUpperCase() : 'DRAFT'}
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.brewprintDetails}>
              <View style={styles.brewprintDetailRow}>
                <ThemedText style={[styles.brewprintDetailLabel, { color: colors.textSecondary }]}>
                  Coffee Dose
                </ThemedText>
                <ThemedText style={[styles.brewprintDetailValue, { color: colors.text }]}>
                  {displayBrewprints[0].coffee_dose || 'Unknown'}g
                </ThemedText>
              </View>
              
              <View style={styles.brewprintDetailRow}>
                <ThemedText style={[styles.brewprintDetailLabel, { color: colors.textSecondary }]}>
                  Water Temp
                </ThemedText>
                <ThemedText style={[styles.brewprintDetailValue, { color: colors.text }]}>
                  {displayBrewprints[0].water_temp || 'Unknown'}°C
                </ThemedText>
              </View>
              
              <View style={styles.brewprintDetailRow}>
                <ThemedText style={[styles.brewprintDetailLabel, { color: colors.textSecondary }]}>
                  Brew Time
                </ThemedText>
                <ThemedText style={[styles.brewprintDetailValue, { color: colors.text }]}>
                  {displayBrewprints[0].total_time ? `${Math.floor(displayBrewprints[0].total_time / 60)}:${(displayBrewprints[0].total_time % 60).toString().padStart(2, '0')}` : 'Unknown'}
                </ThemedText>
              </View>
              
              {displayBrewprints[0].description && (
                <View style={styles.brewprintDescription}>
                  <ThemedText style={[styles.brewprintDescriptionText, { color: colors.textSecondary }]} numberOfLines={2}>
                    {displayBrewprints[0].description}
                  </ThemedText>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Inventory Status */}
        <View style={styles.section}>
          <View style={[styles.inventoryCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.cardHeader}>
              <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
                Inventory Status
              </ThemedText>
              <TouchableOpacity onPress={() => router.push('/(tabs)/library')}>
                <ThemedText style={[styles.cardAction, { color: colors.primary }]}>
                  Manage →
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inventoryDetails}>
              <View style={styles.inventoryRow}>
                <ThemedText style={[styles.inventoryLabel, { color: colors.textSecondary }]}>
                  Total Beans
                </ThemedText>
                <ThemedText style={[styles.inventoryValue, { color: colors.text }]}>
                  {dashboardStats.totalBeans} varieties
                </ThemedText>
              </View>
              
              <View style={styles.inventoryRow}>
                <ThemedText style={[styles.inventoryLabel, { color: colors.textSecondary }]}>
                  Fresh (≤14 days)
                </ThemedText>
                <ThemedText style={[styles.inventoryValue, { color: dashboardStats.freshBeans > 0 ? colors.statusGreen : colors.statusYellow }]}>
                  {dashboardStats.freshBeans} beans
                </ThemedText>
              </View>
              
              <View style={styles.inventoryRow}>
                <ThemedText style={[styles.inventoryLabel, { color: colors.textSecondary }]}>
                  Total Weight
                </ThemedText>
                <ThemedText style={[styles.inventoryValue, { color: colors.text }]}>
                  {Math.round(dashboardStats.totalWeight)}g ({(dashboardStats.totalWeight / 1000).toFixed(1)}kg)
                </ThemedText>
              </View>
              
              <View style={styles.inventoryRow}>
                <ThemedText style={[styles.inventoryLabel, { color: colors.textSecondary }]}>
                  Avg Days Post-Roast
                </ThemedText>
                <ThemedText style={[styles.inventoryValue, { color: colors.text }]}>
                  {beans.length > 0 ? Math.round(beans.filter(b => b.roast_date).reduce((sum, bean) => {
                    const days = Math.floor((new Date().getTime() - new Date(bean.roast_date!).getTime()) / (1000 * 60 * 60 * 24));
                    return sum + days;
                  }, 0) / beans.filter(b => b.roast_date).length) || 0 : 0} days
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Beans - Advanced Details */}
        {beans.length > 0 && (
          <View style={styles.section}>
            <View style={styles.cardHeader}>
              <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
                Current Inventory
              </ThemedText>
              <TouchableOpacity onPress={() => router.push('/(tabs)/library')}>
                <ThemedText style={[styles.cardAction, { color: colors.primary }]}>
                  View All →
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.beansSection}>
              {beans.slice(0, 3).map((bean) => {
                const freshnessDays = bean.roast_date ? 
                  Math.floor((new Date().getTime() - new Date(bean.roast_date).getTime()) / (1000 * 60 * 60 * 24)) : null;
                
                const freshnessStatus = freshnessDays === null ? 'unknown' :
                  freshnessDays <= 7 ? 'peak' : 
                  freshnessDays <= 14 ? 'good' : 
                  freshnessDays <= 21 ? 'fading' : 'stale';
                
                const freshnessColor = freshnessStatus === 'peak' ? colors.statusGreen :
                  freshnessStatus === 'good' ? colors.statusGreen :
                  freshnessStatus === 'fading' ? colors.statusYellow :
                  freshnessStatus === 'stale' ? colors.statusRed : colors.textSecondary;

                return (
                  <TouchableOpacity
                    key={bean.id}
                    style={[styles.advancedBeanCard, { 
                      backgroundColor: colors.cardBackground,
                      borderLeftColor: freshnessColor,
                    }]}
                    onPress={() => handleBeanPress(bean.id)}
                  >
                    <View style={styles.beanCardHeader}>
                      <View style={styles.beanCardMain}>
                        <ThemedText type="defaultSemiBold" style={[styles.beanName, { color: colors.text }]}>
                          {bean.name}
                        </ThemedText>
                        <ThemedText style={[styles.beanRoaster, { color: colors.textSecondary }]}>
                          {bean.roaster || 'Unknown Roaster'}
                        </ThemedText>
                      </View>
                      <View style={styles.beanCardStatus}>
                        <ThemedText style={[styles.freshnessStatus, { color: freshnessColor }]}>
                          {freshnessStatus.toUpperCase()}
                        </ThemedText>
                        <ThemedText style={[styles.beanWeight, { color: colors.text }]}>
                          {bean.weight_grams || 0}g
                        </ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.beanCardDetails}>
                      <View style={styles.beanDetailRow}>
                        <ThemedText style={[styles.beanDetailLabel, { color: colors.textSecondary }]}>
                          Origin
                        </ThemedText>
                        <ThemedText style={[styles.beanDetailValue, { color: colors.text }]}>
                          {bean.origin || 'Unknown'}
                        </ThemedText>
                      </View>
                      
                      <View style={styles.beanDetailRow}>
                        <ThemedText style={[styles.beanDetailLabel, { color: colors.textSecondary }]}>
                          Process
                        </ThemedText>
                        <ThemedText style={[styles.beanDetailValue, { color: colors.text }]}>
                          {bean.process || 'Unknown'}
                        </ThemedText>
                      </View>
                      
                      <View style={styles.beanDetailRow}>
                        <ThemedText style={[styles.beanDetailLabel, { color: colors.textSecondary }]}>
                          Roast Level
                        </ThemedText>
                        <ThemedText style={[styles.beanDetailValue, { color: colors.text }]}>
                          {bean.roast_level ? bean.roast_level.charAt(0).toUpperCase() + bean.roast_level.slice(1).replace('-', ' ') : 'Unknown'}
                        </ThemedText>
                      </View>
                      
                      <View style={styles.beanDetailRow}>
                        <ThemedText style={[styles.beanDetailLabel, { color: colors.textSecondary }]}>
                          Days Post-Roast
                        </ThemedText>
                        <ThemedText style={[styles.beanDetailValue, { color: colors.text }]}>
                          {freshnessDays !== null ? `${freshnessDays} days` : 'Unknown'}
                        </ThemedText>
                      </View>
                      
                      {bean.price && (
                        <View style={styles.beanDetailRow}>
                          <ThemedText style={[styles.beanDetailLabel, { color: colors.textSecondary }]}>
                            Cost/100g
                          </ThemedText>
                          <ThemedText style={[styles.beanDetailValue, { color: colors.text }]}>
                            ${((bean.price / (bean.weight_grams || 1)) * 100).toFixed(2)}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
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
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  
  // Card styles
  analyticsCard: {
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inventoryCard: {
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: '500',
    fontSize: 16,
  },
  cardAction: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Analytics styles
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  analyticsItem: {
    flex: 1,
    minWidth: '40%',
  },
  analyticsLabel: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  
  // Inventory styles
  inventoryDetails: {
    gap: 12,
  },
  inventoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inventoryLabel: {
    fontSize: 14,
  },
  inventoryValue: {
    fontSize: 14,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  
  // Brewprint card styles
  brewprintCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  brewprintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  brewprintMain: {
    flex: 1,
  },
  brewprintName: {
    fontSize: 16,
    marginBottom: 2,
  },
  brewprintSubtitle: {
    fontSize: 13,
  },
  brewprintStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  brewprintDetails: {
    gap: 6,
  },
  brewprintDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brewprintDetailLabel: {
    fontSize: 12,
    flex: 1,
  },
  brewprintDetailValue: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    fontVariant: ['tabular-nums'],
  },
  brewprintDescription: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  brewprintDescriptionText: {
    fontSize: 12,
    lineHeight: 16,
  },

  // Advanced bean card styles
  beansSection: {
    gap: 12,
  },
  advancedBeanCard: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  beanCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  beanCardMain: {
    flex: 1,
  },
  beanName: {
    fontSize: 16,
    marginBottom: 2,
  },
  beanRoaster: {
    fontSize: 13,
  },
  beanCardStatus: {
    alignItems: 'flex-end',
  },
  freshnessStatus: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  beanWeight: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  beanCardDetails: {
    gap: 6,
  },
  beanDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  beanDetailLabel: {
    fontSize: 12,
    flex: 1,
  },
  beanDetailValue: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    fontVariant: ['tabular-nums'],
  },
  
  bottomSpacing: {
    height: 20,
  },
});
