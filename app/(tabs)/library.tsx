import React, { useState, useEffect, useMemo } from 'react';
import { RefreshControl, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { DataLayout, DataGrid, DataSection } from '@/components/ui/DataLayout';
import { DataCard } from '@/components/ui/DataCard';
import { DataMetric } from '@/components/ui/DataMetric';
import { DataText } from '@/components/ui/DataText';
import { DataButton } from '@/components/ui/DataButton';
import { getTheme } from '@/constants/DataFirstDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BeansService, type Bean } from '@/lib/services/beans';
import { BrewersService, type Brewer } from '@/lib/services/brewers';
import { GrindersService, type Grinder } from '@/lib/services/grinders';
import { toast } from 'sonner-native';

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');
  
  const [beans, setBeans] = useState<Bean[]>([]);
  const [brewers, setBrewers] = useState<Brewer[]>([]);
  const [grinders, setGrinders] = useState<Grinder[]>([]);
  const [activeView, setActiveView] = useState<'overview' | 'beans' | 'brewers' | 'grinders'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const renderViewTabs = () => {
    const views = [
      { key: 'overview' as const, label: 'Overview', count: inventoryStats.totalItems },
      { key: 'beans' as const, label: 'Beans', count: inventoryStats.beanCount },
      { key: 'brewers' as const, label: 'Brewers', count: inventoryStats.brewerCount },
      { key: 'grinders' as const, label: 'Grinders', count: inventoryStats.grinderCount },
    ];

    return (
      <View style={{
        flexDirection: 'row',
        gap: theme.spacing[2],
        marginBottom: theme.spacing[6],
      }}>
        {views.map((view) => (
          <TouchableOpacity
            key={view.key}
            style={{
              flex: 1,
              paddingVertical: theme.spacing[2],
              paddingHorizontal: theme.spacing[3],
              borderRadius: theme.layout.card.radius.md,
              backgroundColor: activeView === view.key 
                ? theme.colors.interactive.default 
                : theme.colors.surface,
              borderWidth: 1,
              borderColor: activeView === view.key 
                ? theme.colors.interactive.default 
                : theme.colors.border,
              alignItems: 'center',
            }}
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
            <DataText
              variant="small"
              color={activeView === view.key ? 'inverse' : 'secondary'}
              weight="medium"
              style={{ textAlign: 'center' }}
            >
              {view.label}
            </DataText>
            <DataText
              variant="tiny"
              color={activeView === view.key ? 'inverse' : 'tertiary'}
              weight="medium"
              style={{ textAlign: 'center' }}
            >
              {view.count}
            </DataText>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <DataLayout title="Equipment Library" subtitle="Loading your brewing equipment...">
        <DataCard>
          <DataText variant="body" color="secondary">
            Loading equipment library...
          </DataText>
        </DataCard>
      </DataLayout>
    );
  }

  return (
    <DataLayout
      title="Equipment Library"
      subtitle={`${inventoryStats.totalItems} items in your brewing arsenal`}
      scrollable
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
    >
      {/* View Navigation */}
      <DataSection spacing="lg">
        {renderViewTabs()}
      </DataSection>

      {/* Overview View */}
      {activeView === 'overview' && (
        <>
          {/* Quick Actions */}
          <DataSection title="Quick Actions" spacing="lg">
            <DataGrid columns={3} gap="sm">
              <Link href="/beans/new" onPress={handleHapticFeedback}>
                <DataButton
                  title="Add Bean"
                  variant="secondary"
                  size="sm"
                />
              </Link>
              <Link href="/brewers/new" onPress={handleHapticFeedback}>
                <DataButton
                  title="Add Brewer"
                  variant="secondary"
                  size="sm"
                />
              </Link>
              <Link href="/grinders/new" onPress={handleHapticFeedback}>
                <DataButton
                  title="Add Grinder"
                  variant="secondary"
                  size="sm"
                />
              </Link>
            </DataGrid>
          </DataSection>

          {/* Library Statistics */}
          <DataSection title="Library Overview" spacing="lg">
            <DataGrid columns={2} gap="md">
              <DataCard>
                <DataText variant="small" color="secondary" weight="medium">
                  Total Items
                </DataText>
                <DataText variant="h2" color="primary" weight="bold" style={{ marginVertical: theme.spacing[1] }}>
                  {inventoryStats.totalItems}
                </DataText>
                <DataText variant="tiny" color="tertiary">
                  Equipment pieces
                </DataText>
              </DataCard>
              
              <DataCard>
                <DataText variant="small" color="secondary" weight="medium">
                  Bean Weight
                </DataText>
                <DataText variant="h2" color="primary" weight="bold" style={{ marginVertical: theme.spacing[1] }}>
                  {inventoryStats.totalWeight}g
                </DataText>
                <DataText variant="tiny" color="tertiary">
                  Total inventory
                </DataText>
              </DataCard>
              
              <DataCard>
                <DataText variant="small" color="secondary" weight="medium">
                  Fresh Beans
                </DataText>
                <DataText variant="h2" color="primary" weight="bold" style={{ marginVertical: theme.spacing[1] }}>
                  {inventoryStats.freshBeans}
                </DataText>
                <DataText variant="tiny" color="tertiary">
                  ≤14 days old
                </DataText>
              </DataCard>
              
              <DataCard>
                <DataText variant="small" color="secondary" weight="medium">
                  Inventory Value
                </DataText>
                <DataText variant="h2" color="primary" weight="bold" style={{ marginVertical: theme.spacing[1] }}>
                  ${inventoryStats.totalValue.toFixed(0)}
                </DataText>
                <DataText variant="tiny" color="tertiary">
                  Estimated
                </DataText>
              </DataCard>
            </DataGrid>
          </DataSection>

          {/* Recent Items */}
          <DataSection title="Recent Items" subtitle="Recently added equipment" spacing="lg">
            <DataGrid columns={1} gap="sm">
              {[...inventoryData.beans.slice(0, 2), ...inventoryData.brewers.slice(0, 1)].map((item, index) => {
                const itemType = 'name' in item && 'roast_date' in item ? 'bean' : 'type' in item && 'material' in item ? 'brewer' : 'grinder';
                const href = `/${itemType}-detail/${item.id}`;
                
                return (
                  <Link key={`recent-${index}`} href={href} onPress={handleHapticFeedback}>
                    <DataCard>
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <View style={{ flex: 1 }}>
                          <DataText variant="h4" color="primary" weight="semibold">
                            {item.name}
                          </DataText>
                          <DataText variant="small" color="secondary">
                            {'roast_date' in item ? 'Bean' : 'type' in item ? 'Brewer' : 'Grinder'}
                          </DataText>
                        </View>
                        <DataText variant="small" color="tertiary">
                          →
                        </DataText>
                      </View>
                    </DataCard>
                  </Link>
                );
              })}
            </DataGrid>
          </DataSection>
        </>
      )}

      {/* Beans View */}
      {activeView === 'beans' && (
        <>
          <DataSection title="Bean Management" spacing="lg">
            <Link href="/beans/new" onPress={handleHapticFeedback}>
              <DataButton
                title="Add New Bean"
                variant="primary"
                size="lg"
                fullWidth
              />
            </Link>
          </DataSection>

          {inventoryData.beans.length === 0 ? (
            <DataSection title="No Beans Found" spacing="lg">
              <DataCard
                title="Start Your Bean Collection"
                message="Add your first coffee beans to begin tracking freshness and flavor profiles."
                action={{
                  title: "Add First Bean",
                  onPress: () => handleAddNew('beans'),
                }}
              />
            </DataSection>
          ) : (
            <DataSection title={`Bean Inventory (${inventoryData.beans.length})`} spacing="lg">
              <DataGrid columns={1} gap="md">
                {inventoryData.beans.map((bean) => {
                  const freshnessDays = bean.roast_date ? 
                    Math.floor((new Date().getTime() - new Date(bean.roast_date).getTime()) / (1000 * 60 * 60 * 24)) : null;
                  
                  const freshnessStatus = freshnessDays === null ? 'unknown' :
                    freshnessDays <= 7 ? 'peak' : 
                    freshnessDays <= 14 ? 'good' : 
                    freshnessDays <= 21 ? 'fading' : 'stale';

                  return (
                    <Link key={bean.id} href={`/bean-detail/${bean.id}`} onPress={handleHapticFeedback}>
                      <DataCard>
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: theme.spacing[3],
                      }}>
                        <View style={{ flex: 1 }}>
                          <DataText variant="h4" color="primary" weight="semibold">
                            {bean.name}
                          </DataText>
                          <DataText variant="small" color="secondary">
                            {bean.supplier || 'Independent Roaster'}
                          </DataText>
                        </View>
                        
                        <View style={{
                          paddingHorizontal: theme.spacing[2],
                          paddingVertical: theme.spacing[1],
                          borderRadius: theme.layout.card.radius.sm,
                          backgroundColor: 
                            freshnessStatus === 'peak' || freshnessStatus === 'good'
                              ? theme.colors.success
                              : freshnessStatus === 'fading'
                              ? theme.colors.warning
                              : theme.colors.error,
                        }}>
                          <DataText variant="tiny" color="inverse" weight="medium">
                            {freshnessStatus.toUpperCase()}
                          </DataText>
                        </View>
                      </View>

                      <View style={{
                        flexDirection: 'row',
                        gap: theme.spacing[4],
                        marginBottom: theme.spacing[3],
                      }}>
                        <DataMetric
                          label="Weight"
                          value={bean.remaining_grams || 0}
                          unit="g"
                          size="sm"
                        />
                        {freshnessDays !== null && (
                          <DataMetric
                            label="Age"
                            value={freshnessDays}
                            unit="days"
                            size="sm"
                          />
                        )}
                        {bean.roast_level && (
                          <DataMetric
                            label="Roast"
                            value={bean.roast_level.charAt(0).toUpperCase() + bean.roast_level.slice(1)}
                            size="sm"
                          />
                        )}
                      </View>

                      {bean.origin && (
                        <DataText variant="small" color="secondary">
                          {bean.origin}
                        </DataText>
                      )}
                    </DataCard>
                    </Link>
                  );
                })}
              </DataGrid>
            </DataSection>
          )}
        </>
      )}

      {/* Brewers View */}
      {activeView === 'brewers' && (
        <>
          <DataSection title="Brewer Management" spacing="lg">
            <Link href="/brewers/new" onPress={handleHapticFeedback}>
              <DataButton
                title="Add New Brewer"
                variant="primary"
                size="lg"
                fullWidth
              />
            </Link>
          </DataSection>

          {inventoryData.brewers.length === 0 ? (
            <DataSection title="No Brewers Found" spacing="lg">
              <DataCard
                title="Add Your First Brewer"
                message="Start building your brewing equipment collection with pour-over, espresso, and other brewing methods."
                action={{
                  title: "Add First Brewer",
                  onPress: () => handleAddNew('brewers'),
                }}
              />
            </DataSection>
          ) : (
            <DataSection title={`Brewing Equipment (${inventoryData.brewers.length})`} spacing="lg">
              <DataGrid columns={1} gap="md">
                {inventoryData.brewers.map((brewer) => (
                  <Link key={brewer.id} href={`/brewer-detail/${brewer.id}`} onPress={handleHapticFeedback}>
                    <DataCard>
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: theme.spacing[3],
                    }}>
                      <View style={{ flex: 1 }}>
                        <DataText variant="h4" color="primary" weight="semibold">
                          {brewer.name}
                        </DataText>
                        <DataText variant="small" color="secondary">
                          {brewer.brand ? `${brewer.brand}${brewer.model ? ` ${brewer.model}` : ''}` : brewer.type}
                        </DataText>
                      </View>
                      
                      <View style={{
                        paddingHorizontal: theme.spacing[2],
                        paddingVertical: theme.spacing[1],
                        borderRadius: theme.layout.card.radius.sm,
                        backgroundColor: theme.colors.success,
                      }}>
                        <DataText variant="tiny" color="inverse" weight="medium">
                          ACTIVE
                        </DataText>
                      </View>
                    </View>

                    <View style={{
                      flexDirection: 'row',
                      gap: theme.spacing[4],
                    }}>
                      <DataMetric
                        label="Type"
                        value={brewer.type.charAt(0).toUpperCase() + brewer.type.slice(1)}
                        size="sm"
                      />
                      {brewer.capacity_ml && (
                        <DataMetric
                          label="Capacity"
                          value={brewer.capacity_ml}
                          unit="ml"
                          size="sm"
                        />
                      )}
                      {brewer.material && (
                        <DataMetric
                          label="Material"
                          value={brewer.material}
                          size="sm"
                        />
                      )}
                    </View>
                  </DataCard>
                  </Link>
                ))}
              </DataGrid>
            </DataSection>
          )}
        </>
      )}

      {/* Grinders View */}
      {activeView === 'grinders' && (
        <>
          <DataSection title="Grinder Management" spacing="lg">
            <Link href="/grinders/new" onPress={handleHapticFeedback}>
              <DataButton
                title="Add New Grinder"
                variant="primary"
                size="lg"
                fullWidth
              />
            </Link>
          </DataSection>

          {inventoryData.grinders.length === 0 ? (
            <DataSection title="No Grinders Found" spacing="lg">
              <DataCard
                title="Add Your First Grinder"
                message="Track your grinder settings and maintain consistent grind profiles for optimal extraction."
                action={{
                  title: "Add First Grinder",
                  onPress: () => handleAddNew('grinders'),
                }}
              />
            </DataSection>
          ) : (
            <DataSection title={`Grinding Equipment (${inventoryData.grinders.length})`} spacing="lg">
              <DataGrid columns={1} gap="md">
                {inventoryData.grinders.map((grinder) => (
                  <Link key={grinder.id} href={`/grinder-detail/${grinder.id}`} onPress={handleHapticFeedback}>
                    <DataCard>
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: theme.spacing[3],
                    }}>
                      <View style={{ flex: 1 }}>
                        <DataText variant="h4" color="primary" weight="semibold">
                          {grinder.name}
                        </DataText>
                        <DataText variant="small" color="secondary">
                          {grinder.brand ? `${grinder.brand}${grinder.model ? ` ${grinder.model}` : ''}` : grinder.type}
                        </DataText>
                      </View>
                      
                      <View style={{
                        paddingHorizontal: theme.spacing[2],
                        paddingVertical: theme.spacing[1],
                        borderRadius: theme.layout.card.radius.sm,
                        backgroundColor: theme.colors.success,
                      }}>
                        <DataText variant="tiny" color="inverse" weight="medium">
                          ACTIVE
                        </DataText>
                      </View>
                    </View>

                    <View style={{
                      flexDirection: 'row',
                      gap: theme.spacing[4],
                    }}>
                      <DataMetric
                        label="Type"
                        value={grinder.type.charAt(0).toUpperCase() + grinder.type.slice(1)}
                        size="sm"
                      />
                      {grinder.burr_size && (
                        <DataMetric
                          label="Burr Size"
                          value={grinder.burr_size}
                          unit="mm"
                          size="sm"
                        />
                      )}
                      {grinder.burr_material && (
                        <DataMetric
                          label="Burr Material"
                          value={grinder.burr_material}
                          size="sm"
                        />
                      )}
                    </View>
                  </DataCard>
                  </Link>
                ))}
              </DataGrid>
            </DataSection>
          )}
        </>
      )}
    </DataLayout>
  );
}

