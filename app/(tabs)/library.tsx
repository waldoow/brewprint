import { StyleSheet, ScrollView, View, RefreshControl, TouchableOpacity } from 'react-native';
import { SearchBar } from "@/components/ui/SearchBar";
import { Header } from "@/components/ui/Header";
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedTabs } from '@/components/ui/ThemedTabs';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BeansService, type Bean } from '@/lib/services/beans';
import { BrewersService, type Brewer } from '@/lib/services/brewers';
import { GrindersService, type Grinder } from '@/lib/services/grinders';
import { router } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const [searchQuery, setSearchQuery] = useState("");
  const [beans, setBeans] = useState<Bean[]>([]);
  const [brewers, setBrewers] = useState<Brewer[]>([]);
  const [grinders, setGrinders] = useState<Grinder[]>([]);
  const [activeTab, setActiveTab] = useState<'beans' | 'brewers' | 'grinders'>('beans');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const [beansResult, brewersResult, grindersResult] = await Promise.all([
        BeansService.getAllBeans(),
        BrewersService.getAllBrewers(),
        GrindersService.getAllGrinders()
      ]);
      
      if (beansResult.success && beansResult.data) {
        setBeans(beansResult.data);
      } else {
        console.error('Failed to load beans:', beansResult.error);
      }
      
      if (brewersResult.success && brewersResult.data) {
        setBrewers(brewersResult.data);
      } else {
        console.error('Failed to load brewers:', brewersResult.error);
      }

      if (grindersResult.success && grindersResult.data) {
        setGrinders(grindersResult.data);
      } else {
        console.error('Failed to load grinders:', grindersResult.error);
      }
      
      if (!beansResult.success && !brewersResult.success && !grindersResult.success) {
        toast.error('Failed to load inventory');
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInventoryData();
    setRefreshing(false);
  };

  // Filter and sort inventory data
  const filteredData = useMemo(() => {
    const filteredBeans = beans.filter(bean => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        bean.name.toLowerCase().includes(query) ||
        bean.roaster?.toLowerCase().includes(query) ||
        bean.origin?.toLowerCase().includes(query) ||
        bean.roast_level?.toLowerCase().includes(query) ||
        bean.variety?.toLowerCase().includes(query) ||
        bean.process?.toLowerCase().includes(query)
      );
    }).sort((a, b) => {
      const getDays = (bean: Bean) => bean.roast_date ? 
        Math.floor((new Date().getTime() - new Date(bean.roast_date).getTime()) / (1000 * 60 * 60 * 24)) : 999;
      
      const aDays = getDays(a);
      const bDays = getDays(b);
      
      if (aDays !== bDays) {
        return aDays - bDays; // Fresh first
      }
      return a.name.localeCompare(b.name);
    });
    
    const filteredBrewers = brewers.filter(brewer => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        brewer.name.toLowerCase().includes(query) ||
        brewer.brand?.toLowerCase().includes(query) ||
        brewer.model?.toLowerCase().includes(query) ||
        brewer.type.toLowerCase().includes(query) ||
        brewer.notes?.toLowerCase().includes(query)
      );
    }).sort((a, b) => {
      // Sort by active status first, then by condition, then by name
      if (a.is_active !== b.is_active) {
        return a.is_active ? -1 : 1;
      }
      const conditionOrder = { excellent: 0, good: 1, fair: 2, 'needs-replacement': 3 };
      const aOrder = conditionOrder[a.condition];
      const bOrder = conditionOrder[b.condition];
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      return a.name.localeCompare(b.name);
    });

    const filteredGrinders = grinders.filter(grinder => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        grinder.name.toLowerCase().includes(query) ||
        grinder.brand?.toLowerCase().includes(query) ||
        grinder.model?.toLowerCase().includes(query) ||
        grinder.type.toLowerCase().includes(query) ||
        grinder.notes?.toLowerCase().includes(query)
      );
    }).sort((a, b) => {
      // Sort by active status first, then by condition, then by name
      if (a.is_active !== b.is_active) {
        return a.is_active ? -1 : 1;
      }
      const conditionOrder = { excellent: 0, good: 1, fair: 2, 'needs-replacement': 3 };
      const aOrder = conditionOrder[a.condition];
      const bOrder = conditionOrder[b.condition];
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      return a.name.localeCompare(b.name);
    });
    
    return { beans: filteredBeans, brewers: filteredBrewers, grinders: filteredGrinders };
  }, [beans, brewers, grinders, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterPress = () => {
    console.log('Filter inventory pressed');
  };

  const handleAddItem = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue without feedback
    }
    if (activeTab === 'beans') {
      router.push('/beans/new');
    } else if (activeTab === 'brewers') {
      router.push('/brewers/new');
    } else {
      router.push('/grinders/new');
    }
  };

  const handleBeanPress = (beanId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue without feedback
    }
    router.push(`/(tabs)/bean-detail/${beanId}`);
  };
  
  const handleBrewerPress = (brewerId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue without feedback
    }
    router.push(`/(tabs)/brewer-detail/${brewerId}`);
  };

  const handleGrinderPress = (grinderId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue without feedback
    }
    router.push(`/(tabs)/grinder-detail/${grinderId}`);
  };

  const handleCreateMenuPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue without feedback
    }
    setShowActionSheet(true);
  };

  const createActions = [
    {
      id: 'beans',
      title: 'Add New Bean',
      icon: 'bean',
      onPress: () => router.push('/beans/new')
    },
    {
      id: 'brewers',
      title: 'Add New Brewer',
      icon: 'brewer',
      onPress: () => router.push('/brewers/new')
    },
    {
      id: 'grinders',
      title: 'Add New Grinder',
      icon: 'grinder',
      onPress: () => router.push('/grinders/new')
    }
  ];

  const currentData = activeTab === 'beans' ? filteredData.beans : 
                     activeTab === 'brewers' ? filteredData.brewers : 
                     filteredData.grinders;

  return (
    <ThemedView noBackground={false} style={styles.container}>
      <Header 
        title="Equipment Inventory"
        subtitle={`${currentData.length} ${activeTab}`}
        showBackButton={false}
        showMenuButton={true}
        showProfileAvatar={true}
        showSearchButton={true}
        onMenuPress={() => console.log('Menu pressed')}
        onProfilePress={() => console.log('Profile pressed')}
        onSearchPress={() => console.log('Search pressed')}
        showTopSpacing={true}
        rightAction={{
          icon: 'ellipsis-horizontal',
          onPress: handleCreateMenuPress
        }}
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
        {/* Tabs for Beans, Brewers, and Grinders */}
        <ThemedView style={styles.tabsContainer}>
          <ThemedTabs
            items={[
              { value: 'beans', label: `Beans (${filteredData.beans.length})` },
              { value: 'brewers', label: `Brewers (${filteredData.brewers.length})` },
              { value: 'grinders', label: `Grinders (${filteredData.grinders.length})` }
            ]}
            defaultValue={activeTab}
            onValueChange={(value) => setActiveTab(value as 'beans' | 'brewers' | 'grinders')}
          />
        </ThemedView>
        
        {/* Search Bar */}
        <SearchBar 
          placeholder={`Search ${activeTab}...`}
          onSearch={handleSearch}
          onFilterPress={handleFilterPress}
          style={styles.searchSection}
        />

        {/* Content Area */}
        <ThemedView style={styles.inventorySection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={{ color: colors.textSecondary }}>
                Loading inventory...
              </ThemedText>
            </View>
          ) : currentData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
                {activeTab === 'beans' 
                  ? (beans.length === 0 ? 'No beans' : 'No matching beans')
                  : activeTab === 'brewers' 
                  ? (brewers.length === 0 ? 'No brewers' : 'No matching brewers')
                  : (grinders.length === 0 ? 'No grinders' : 'No matching grinders')
                }
              </ThemedText>
              <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                {activeTab === 'beans' 
                  ? (beans.length === 0 
                      ? 'Add your first coffee beans to begin tracking freshness and optimization'
                      : 'Refine search criteria: name, roaster, origin, variety, or process method'
                    )
                  : activeTab === 'brewers'
                  ? (brewers.length === 0
                      ? 'Add your first brewing equipment to begin tracking brewing parameters'
                      : 'Refine search criteria: name, brand, model, type, or notes'
                    )
                  : (grinders.length === 0
                      ? 'Add your first grinder to begin tracking grind settings and maintenance'
                      : 'Refine search criteria: name, brand, model, type, or notes'
                    )
                }
              </ThemedText>
              {((activeTab === 'beans' && beans.length === 0) || 
                (activeTab === 'brewers' && brewers.length === 0) ||
                (activeTab === 'grinders' && grinders.length === 0)) && (
                <ThemedButton
                  title={`Add First ${activeTab === 'beans' ? 'Bean' : activeTab === 'brewers' ? 'Brewer' : 'Grinder'}`}
                  onPress={handleAddItem}
                  variant="default"
                  size="default"
                  style={styles.addFirstButton}
                />
              )}
            </View>
          ) : (
            <View style={styles.itemsGrid}>
              {activeTab === 'beans' ? (
                // Render beans
                (filteredData.beans as Bean[]).map((bean) => {
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
                      style={[styles.itemCard, { 
                        backgroundColor: colors.cardBackground,
                        borderLeftColor: freshnessColor,
                      }]}
                      onPress={() => handleBeanPress(bean.id)}
                    >
                      <View style={styles.itemHeader}>
                        <View style={styles.itemMain}>
                          <ThemedText type="defaultSemiBold" style={[styles.itemName, { color: colors.text }]}>
                            {bean.name}
                          </ThemedText>
                          <ThemedText style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                            {bean.roaster || 'Independent Roaster'}
                          </ThemedText>
                        </View>
                        <View style={styles.itemStatus}>
                          <ThemedText style={[styles.statusText, { color: freshnessColor }]}>
                            {freshnessStatus.toUpperCase()}
                          </ThemedText>
                          <ThemedText style={[styles.itemWeight, { color: colors.text }]}>
                            {bean.weight_grams || 0}g
                          </ThemedText>
                        </View>
                      </View>
                      
                      <View style={styles.itemDetails}>
                        <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                          {bean.origin || 'Unknown Origin'} • {bean.roast_level ? bean.roast_level.charAt(0).toUpperCase() + bean.roast_level.slice(1).replace('-', ' ') : 'Unknown Roast'}
                        </ThemedText>
                        {freshnessDays !== null && (
                          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                            {freshnessDays} days post-roast
                          </ThemedText>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : activeTab === 'brewers' ? (
                // Render brewers
                (filteredData.brewers as Brewer[]).map((brewer) => {
                  const statusColor = brewer.is_active ? colors.statusGreen : colors.textSecondary;
                  const conditionColor = brewer.condition === 'excellent' ? colors.statusGreen :
                    brewer.condition === 'good' ? colors.statusGreen :
                    brewer.condition === 'fair' ? colors.statusYellow :
                    colors.statusRed;

                  return (
                    <TouchableOpacity
                      key={brewer.id}
                      style={[styles.itemCard, { 
                        backgroundColor: colors.cardBackground,
                        borderLeftColor: statusColor,
                      }]}
                      onPress={() => handleBrewerPress(brewer.id)}
                    >
                      <View style={styles.itemHeader}>
                        <View style={styles.itemMain}>
                          <ThemedText type="defaultSemiBold" style={[styles.itemName, { color: colors.text }]}>
                            {brewer.name}
                          </ThemedText>
                          <ThemedText style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                            {brewer.brand ? `${brewer.brand}${brewer.model ? ` ${brewer.model}` : ''}` : brewer.type.toUpperCase()}
                          </ThemedText>
                        </View>
                        <View style={styles.itemStatus}>
                          <ThemedText style={[styles.statusText, { color: statusColor }]}>
                            {brewer.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </ThemedText>
                          <ThemedText style={[styles.conditionText, { color: conditionColor }]}>
                            {brewer.condition.toUpperCase()}
                          </ThemedText>
                        </View>
                      </View>
                      
                      <View style={styles.itemDetails}>
                        <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                          {brewer.type.charAt(0).toUpperCase() + brewer.type.slice(1).replace('-', ' ')} • {brewer.size || 'Standard Size'}
                        </ThemedText>
                        {brewer.capacity_ml && (
                          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                            {brewer.capacity_ml}ml capacity
                          </ThemedText>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                // Render grinders
                (filteredData.grinders as Grinder[]).map((grinder) => {
                  const statusColor = grinder.is_active ? colors.statusGreen : colors.textSecondary;
                  const conditionColor = grinder.condition === 'excellent' ? colors.statusGreen :
                    grinder.condition === 'good' ? colors.statusGreen :
                    grinder.condition === 'fair' ? colors.statusYellow :
                    colors.statusRed;

                  return (
                    <TouchableOpacity
                      key={grinder.id}
                      style={[styles.itemCard, { 
                        backgroundColor: colors.cardBackground,
                        borderLeftColor: statusColor,
                      }]}
                      onPress={() => handleGrinderPress(grinder.id)}
                    >
                      <View style={styles.itemHeader}>
                        <View style={styles.itemMain}>
                          <ThemedText type="defaultSemiBold" style={[styles.itemName, { color: colors.text }]}>
                            {grinder.name}
                          </ThemedText>
                          <ThemedText style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                            {grinder.brand ? `${grinder.brand}${grinder.model ? ` ${grinder.model}` : ''}` : grinder.type.toUpperCase()}
                          </ThemedText>
                        </View>
                        <View style={styles.itemStatus}>
                          <ThemedText style={[styles.statusText, { color: statusColor }]}>
                            {grinder.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </ThemedText>
                          <ThemedText style={[styles.conditionText, { color: conditionColor }]}>
                            {grinder.condition.toUpperCase()}
                          </ThemedText>
                        </View>
                      </View>
                      
                      <View style={styles.itemDetails}>
                        <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                          {grinder.type.charAt(0).toUpperCase() + grinder.type.slice(1).replace('-', ' ')} • {grinder.size || 'Standard Size'}
                        </ThemedText>
                        {grinder.burr_size && (
                          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                            {grinder.burr_size}mm burr size
                          </ThemedText>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}
        </ThemedView>
      </ScrollView>

      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="Add New Item"
        actions={createActions}
      />
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
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchSection: {
    marginTop: 8,
  },
  inventorySection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontSize: 14,
  },
  addFirstButton: {
    minWidth: 140,
  },
  
  // Item grid and card styles
  itemsGrid: {
    gap: 12,
  },
  itemCard: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemMain: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
  },
  itemStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  itemWeight: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  itemDetails: {
    gap: 2,
  },
  detailText: {
    fontSize: 12,
    lineHeight: 16,
  },
});