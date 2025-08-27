import React, { useState, useEffect, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  View,
  Text,
  Button,
  TouchableOpacity,
} from 'react-native-ui-lib';
import { BeansService, type Bean } from '@/lib/services/beans';
import { BrewersService, type Brewer } from '@/lib/services/brewers';
import { GrindersService, type Grinder } from '@/lib/services/grinders';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { toast } from 'sonner-native';

export default function LibraryScreen() {
  const [beans, setBeans] = useState<Bean[]>([]);
  const [brewers, setBrewers] = useState<Brewer[]>([]);
  const [grinders, setGrinders] = useState<Grinder[]>([]);
  const [activeView, setActiveView] = useState<'overview' | 'beans' | 'brewers' | 'grinders'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setIsLoading(true);
      const [beansResult, brewersResult, grindersResult] = await Promise.all([
        BeansService.getAllBeans(),
        BrewersService.getAllBrewers(),
        GrindersService.getAllGrinders()
      ]);
      
      if (beansResult.success && beansResult.data) {
        setBeans(beansResult.data);
      }
      
      if (brewersResult.success && brewersResult.data) {
        setBrewers(brewersResult.data);
      }

      if (grindersResult.success && grindersResult.data) {
        setGrinders(grindersResult.data);
      }
      
      if (!beansResult.success && !brewersResult.success && !grindersResult.success) {
        toast.error('Failed to load equipment library');
      }
    } catch {
      toast.error('Error loading equipment library');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInventoryData();
    setIsRefreshing(false);
  };

  // Organize and analyze inventory data
  const inventoryData = useMemo(() => {
    const sortedBeans = beans.sort((a, b) => {
      const getDays = (bean: Bean) => bean.roast_date ? 
        Math.floor((new Date().getTime() - new Date(bean.roast_date).getTime()) / (1000 * 60 * 60 * 24)) : 999;
      
      const aDays = getDays(a);
      const bDays = getDays(b);
      
      if (aDays !== bDays) {
        return aDays - bDays; // Fresh first
      }
      return a.name.localeCompare(b.name);
    });
    
    const sortedBrewers = brewers.sort((a, b) => a.name.localeCompare(b.name));
    const sortedGrinders = grinders.sort((a, b) => a.name.localeCompare(b.name));

    return { beans: sortedBeans, brewers: sortedBrewers, grinders: sortedGrinders };
  }, [beans, brewers, grinders]);

  // Calculate inventory statistics
  const inventoryStats = useMemo(() => {
    const totalWeight = beans.reduce((sum, bean) => sum + (bean.remaining_grams || 0), 0);
    const freshBeans = beans.filter(bean => {
      if (!bean.roast_date) return false;
      const days = Math.floor((new Date().getTime() - new Date(bean.roast_date).getTime()) / (1000 * 60 * 60 * 24));
      return days <= 14;
    }).length;
    
    const totalValue = beans.reduce((sum, bean) => sum + ((bean.price_per_kg || 0) * (bean.remaining_grams || 0) / 1000), 0);
    
    return {
      totalItems: beans.length + brewers.length + grinders.length,
      totalWeight,
      freshBeans,
      totalValue,
      beanCount: beans.length,
      brewerCount: brewers.length,
      grinderCount: grinders.length,
    };
  }, [beans, brewers, grinders]);

  const handleHapticFeedback = () => {
    if (Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAddNew = (type: string) => {
    toast.success(`Navigate to add new ${type} screen`);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 64,
      paddingBottom: 24,
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    pageTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    tabContainer: {
      flexDirection: 'row',
      gap: 1,
      marginBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: theme.colors.text.primary,
    },
    tabText: {
      fontSize: 11,
      fontWeight: '500',
      textAlign: 'center',
    },
    activeTabText: {
      color: theme.colors.text.primary,
    },
    inactiveTabText: {
      color: theme.colors.text.secondary,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 16,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 10,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
    quickActionRow: {
      flexDirection: 'row',
      gap: 12,
    },
    quickActionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    quickActionText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    inventoryItem: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    itemName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      flex: 1,
      marginRight: 8,
    },
    itemBrand: {
      fontSize: 11,
      color: theme.colors.text.secondary,
      marginBottom: 8,
    },
    itemParams: {
      flexDirection: 'row',
      gap: 12,
    },
    paramItem: {
      alignItems: 'flex-start',
    },
    paramLabel: {
      fontSize: 9,
      color: theme.colors.text.tertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    paramValue: {
      fontSize: 11,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    statusBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 3,
    },
    statusText: {
      fontSize: 8,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    emptyState: {
      paddingVertical: 32,
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 8,
    },
    emptyDescription: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 18,
    },
  });

  const renderViewTabs = () => {
    const views = [
      { key: 'overview' as const, label: 'Overview', count: inventoryStats.totalItems },
      { key: 'beans' as const, label: 'Beans', count: inventoryStats.beanCount },
      { key: 'brewers' as const, label: 'Brewers', count: inventoryStats.brewerCount },
      { key: 'grinders' as const, label: 'Grinders', count: inventoryStats.grinderCount },
    ];

    return (
      <View style={styles.tabContainer}>
        {views.map((view) => (
          <TouchableOpacity
            key={view.key}
            style={[
              styles.tab,
              activeView === view.key ? styles.activeTab : {},
            ]}
            onPress={() => {
              if (Haptics.impactAsync) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setActiveView(view.key);
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`View ${view.label}, ${view.count} items`}
          >
            <Text
              style={[
                styles.tabText,
                activeView === view.key ? styles.activeTabText : styles.inactiveTabText,
              ]}
            >
              {view.label} {view.count}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>
            Library
          </Text>
          <Text style={{ fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 }}>
            Loading your brewing equipment...
          </Text>
        </View>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: theme.colors.text.secondary }}>
            Loading equipment library...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>
          Library
        </Text>
        <Text style={{ fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 }}>
          {inventoryStats.totalItems} items in your collection
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* View Navigation */}
        {renderViewTabs()}

        {/* Overview View */}
        {activeView === 'overview' && (
          <>
            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Quick Actions
              </Text>
              <View style={styles.quickActionRow}>
                <Link href="/beans/new" onPress={handleHapticFeedback} asChild>
                  <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7}>
                    <Text style={styles.quickActionText}>Add Bean</Text>
                  </TouchableOpacity>
                </Link>
                <Link href="/brewers/new" onPress={handleHapticFeedback} asChild>
                  <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7}>
                    <Text style={styles.quickActionText}>Add Brewer</Text>
                  </TouchableOpacity>
                </Link>
                <Link href="/grinders/new" onPress={handleHapticFeedback} asChild>
                  <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7}>
                    <Text style={styles.quickActionText}>Add Grinder</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>

            {/* Library Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Overview
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {inventoryStats.totalItems}
                  </Text>
                  <Text style={styles.statLabel}>
                    Total Items
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {inventoryStats.totalWeight}g
                  </Text>
                  <Text style={styles.statLabel}>
                    Bean Weight
                  </Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {inventoryStats.freshBeans}
                  </Text>
                  <Text style={styles.statLabel}>
                    Fresh Beans
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    ${inventoryStats.totalValue.toFixed(0)}
                  </Text>
                  <Text style={styles.statLabel}>
                    Estimated Value
                  </Text>
                </View>
              </View>
            </View>

          {/* Recent Items */}
          <View marginB-xxl>
            <Text h3 textColor marginB-xs>
              Recent Items
            </Text>
            <Text body textSecondary marginB-md>
              Recently added equipment
            </Text>
            <View gap-sm>
              {[...inventoryData.beans.slice(0, 2), ...inventoryData.brewers.slice(0, 1)].map((item, index) => {
                const itemType = 'name' in item && 'roast_date' in item ? 'bean' : 'type' in item && 'material' in item ? 'brewer' : 'grinder';
                const href = `/${itemType}-detail/${item.id}`;
                
                return (
                  <Link key={`recent-${index}`} href={href} onPress={handleHapticFeedback} asChild>
                    <TouchableOpacity>
                      <Card padding-md>
                        <View row spread centerV>
                          <View flex>
                            <Text h4 textColor>
                              {item.name}
                            </Text>
                            <Text caption textSecondary>
                              {'roast_date' in item ? 'Bean' : 'type' in item ? 'Brewer' : 'Grinder'}
                            </Text>
                          </View>
                          <Text caption textTertiary>
                            →
                          </Text>
                        </View>
                      </Card>
                    </TouchableOpacity>
                  </Link>
                );
              })}
            </View>
          </View>
        </>
      )}

      {/* Beans View */}
      {activeView === 'beans' && (
        <>
          <View marginB-xxl>
            <Text h3 textColor marginB-md>
              Bean Management
            </Text>
            <Link href="/beans/new" onPress={handleHapticFeedback} asChild>
              <Button
                label="Add New Bean"
                backgroundColor={Colors.blue30}
                size="large"
                fullWidth
              />
            </Link>
          </View>

          {inventoryData.beans.length === 0 ? (
            <View marginB-xxl>
              <Text h3 textColor marginB-md>
                No Beans Found
              </Text>
              <Card padding-lg centerH>
                <Text h4 textColor marginB-sm>
                  Start Your Bean Collection
                </Text>
                <Text body textSecondary marginB-md centerH>
                  Add your first coffee beans to begin tracking freshness and flavor profiles.
                </Text>
                <Button
                  label="Add First Bean"
                  onPress={() => handleAddNew('beans')}
                  backgroundColor={Colors.blue30}
                />
              </Card>
            </View>
          ) : (
            <View marginB-xxl>
              <Text h3 textColor marginB-md>
                Bean Inventory ({inventoryData.beans.length})
              </Text>
              <View gap-md>
                {inventoryData.beans.map((bean) => {
                  const freshnessDays = bean.roast_date ? 
                    Math.floor((new Date().getTime() - new Date(bean.roast_date).getTime()) / (1000 * 60 * 60 * 24)) : null;
                  
                  const freshnessStatus = freshnessDays === null ? 'unknown' :
                    freshnessDays <= 7 ? 'peak' : 
                    freshnessDays <= 14 ? 'good' : 
                    freshnessDays <= 21 ? 'fading' : 'stale';
                  
                  const statusColor = 
                    freshnessStatus === 'peak' || freshnessStatus === 'good'
                      ? Colors.green30
                      : freshnessStatus === 'fading'
                      ? Colors.yellow30
                      : Colors.red30;

                  return (
                    <Link key={bean.id} href={`/bean-detail/${bean.id}`} onPress={handleHapticFeedback} asChild>
                      <TouchableOpacity>
                        <Card padding-md>
                          <View row spread marginB-md>
                            <View flex>
                              <Text h4 textColor marginB-xs>
                                {bean.name}
                              </Text>
                              <Text body textSecondary>
                                {bean.supplier || 'Independent Roaster'}
                              </Text>
                            </View>
                            
                            <View
                              style={{
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 4,
                                backgroundColor: statusColor,
                              }}
                            >
                              <Text tiny white>
                                {freshnessStatus.toUpperCase()}
                              </Text>
                            </View>
                          </View>

                          <View
                            style={{
                              flexDirection: 'row',
                              gap: 16,
                              marginBottom: 12,
                            }}
                          >
                            <View>
                              <Text caption textTertiary>
                                Weight
                              </Text>
                              <Text body textColor>
                                {bean.remaining_grams || 0}g
                              </Text>
                            </View>
                            {freshnessDays !== null && (
                              <View>
                                <Text caption textTertiary>
                                  Age
                                </Text>
                                <Text body textColor>
                                  {freshnessDays} days
                                </Text>
                              </View>
                            )}
                            {bean.roast_level && (
                              <View>
                                <Text caption textTertiary>
                                  Roast
                                </Text>
                                <Text body textColor>
                                  {bean.roast_level.charAt(0).toUpperCase() + bean.roast_level.slice(1)}
                                </Text>
                              </View>
                            )}
                          </View>

                          {bean.origin && (
                            <Text caption textSecondary>
                              {bean.origin}
                            </Text>
                          )}
                        </Card>
                      </TouchableOpacity>
                    </Link>
                  );
                })}
              </View>
            </View>
          )}
        </>
      )}

      {/* Brewers View */}
      {activeView === 'brewers' && (
        <>
          <View marginB-xxl>
            <Text h3 textColor marginB-md>
              Brewer Management
            </Text>
            <Link href="/brewers/new" onPress={handleHapticFeedback} asChild>
              <Button
                label="Add New Brewer"
                backgroundColor={Colors.blue30}
                size="large"
                fullWidth
              />
            </Link>
          </View>

          {inventoryData.brewers.length === 0 ? (
            <View marginB-xxl>
              <Text h3 textColor marginB-md>
                No Brewers Found
              </Text>
              <Card padding-lg centerH>
                <Text h4 textColor marginB-sm>
                  Add Your First Brewer
                </Text>
                <Text body textSecondary marginB-md centerH>
                  Start building your brewing equipment collection with pour-over, espresso, and other brewing methods.
                </Text>
                <Button
                  label="Add First Brewer"
                  onPress={() => handleAddNew('brewers')}
                  backgroundColor={Colors.blue30}
                />
              </Card>
            </View>
          ) : (
            <View marginB-xxl>
              <Text h3 textColor marginB-md>
                Brewing Equipment ({inventoryData.brewers.length})
              </Text>
              <View gap-md>
                {inventoryData.brewers.map((brewer) => (
                  <Link key={brewer.id} href={`/brewer-detail/${brewer.id}`} onPress={handleHapticFeedback} asChild>
                    <TouchableOpacity>
                      <Card padding-md>
                        <View row spread marginB-md>
                          <View flex>
                            <Text h4 textColor marginB-xs>
                              {brewer.name}
                            </Text>
                            <Text body textSecondary>
                              {brewer.brand ? `${brewer.brand}${brewer.model ? ` ${brewer.model}` : ''}` : brewer.type}
                            </Text>
                          </View>
                          
                          <View
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 4,
                              backgroundColor: Colors.green30,
                            }}
                          >
                            <Text tiny white>
                              ACTIVE
                            </Text>
                          </View>
                        </View>

                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 16,
                          }}
                        >
                          <View>
                            <Text caption textTertiary>
                              Type
                            </Text>
                            <Text body textColor>
                              {brewer.type.charAt(0).toUpperCase() + brewer.type.slice(1)}
                            </Text>
                          </View>
                          {brewer.capacity_ml && (
                            <View>
                              <Text caption textTertiary>
                                Capacity
                              </Text>
                              <Text body textColor>
                                {brewer.capacity_ml}ml
                              </Text>
                            </View>
                          )}
                          {brewer.material && (
                            <View>
                              <Text caption textTertiary>
                                Material
                              </Text>
                              <Text body textColor>
                                {brewer.material}
                              </Text>
                            </View>
                          )}
                        </View>
                      </Card>
                    </TouchableOpacity>
                  </Link>
                ))}
              </View>
            </View>
          )}
        </>
      )}

      {/* Grinders View */}
      {activeView === 'grinders' && (
        <>
          <View marginB-xxl>
            <Text h3 textColor marginB-md>
              Grinder Management
            </Text>
            <Link href="/grinders/new" onPress={handleHapticFeedback} asChild>
              <Button
                label="Add New Grinder"
                backgroundColor={Colors.blue30}
                size="large"
                fullWidth
              />
            </Link>
          </View>

          {inventoryData.grinders.length === 0 ? (
            <View marginB-xxl>
              <Text h3 textColor marginB-md>
                No Grinders Found
              </Text>
              <Card padding-lg centerH>
                <Text h4 textColor marginB-sm>
                  Add Your First Grinder
                </Text>
                <Text body textSecondary marginB-md centerH>
                  Track your grinder settings and maintain consistent grind profiles for optimal extraction.
                </Text>
                <Button
                  label="Add First Grinder"
                  onPress={() => handleAddNew('grinders')}
                  backgroundColor={Colors.blue30}
                />
              </Card>
            </View>
          ) : (
            <View marginB-xxl>
              <Text h3 textColor marginB-md>
                Grinding Equipment ({inventoryData.grinders.length})
              </Text>
              <View gap-md>
                {inventoryData.grinders.map((grinder) => (
                  <Link key={grinder.id} href={`/grinder-detail/${grinder.id}`} onPress={handleHapticFeedback} asChild>
                    <TouchableOpacity>
                      <Card padding-md>
                        <View row spread marginB-md>
                          <View flex>
                            <Text h4 textColor marginB-xs>
                              {grinder.name}
                            </Text>
                            <Text body textSecondary>
                              {grinder.brand ? `${grinder.brand}${grinder.model ? ` ${grinder.model}` : ''}` : grinder.type}
                            </Text>
                          </View>
                          
                          <View
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 4,
                              backgroundColor: Colors.green30,
                            }}
                          >
                            <Text tiny white>
                              ACTIVE
                            </Text>
                          </View>
                        </View>

                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 16,
                          }}
                        >
                          <View>
                            <Text caption textTertiary>
                              Type
                            </Text>
                            <Text body textColor>
                              {grinder.type.charAt(0).toUpperCase() + grinder.type.slice(1)}
                            </Text>
                          </View>
                          {grinder.burr_size && (
                            <View>
                              <Text caption textTertiary>
                                Burr Size
                              </Text>
                              <Text body textColor>
                                {grinder.burr_size}mm
                              </Text>
                            </View>
                          )}
                          {grinder.burr_material && (
                            <View>
                              <Text caption textTertiary>
                                Burr Material
                              </Text>
                              <Text body textColor>
                                {grinder.burr_material}
                              </Text>
                            </View>
                          )}
                        </View>
                      </Card>
                    </TouchableOpacity>
                  </Link>
                ))}
              </View>
            </View>
          )}
        </>
      )}
      </ScrollView>
    </View>
  );
}

