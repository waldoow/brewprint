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
        bean.supplier?.toLowerCase().includes(query) ||
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

  const populateSampleData = async () => {
    try {
      toast.info('Creating sample data...');
      
      // Create default brewers
      const brewersResult = await BrewersService.createDefaultBrewers();
      if (brewersResult.success && brewersResult.data) {
        toast.success(`Created ${brewersResult.data.length} sample brewers`);
      } else {
        toast.error('Failed to create brewers: ' + brewersResult.error);
      }

      // Create sample beans
      const sampleBeans = [
        {
          name: "Ethiopian Yirgacheffe G1",
          origin: "Ethiopia",
          region: "Yirgacheffe",
          farm: "Kochere Washing Station",
          altitude: 1850,
          process: 'washed' as const,
          variety: "Heirloom Ethiopian",
          purchase_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          roast_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          supplier: "Sweet Maria's Coffee Supply",
          cost: 18.50,
          total_grams: 340,
          remaining_grams: 280,
          roast_level: 'light' as const,
          tasting_notes: ["lemon", "floral", "tea-like", "bright acidity"],
          official_description: "Classic Yirgacheffe with bright citrus notes and floral aromatics.",
          my_notes: "Perfect for pour-over methods. Really shines in V60.",
          rating: 5
        },
        {
          name: "Colombian Huila Supremo",
          origin: "Colombia",
          region: "Huila", 
          farm: "Finca El Paraiso",
          altitude: 1650,
          process: 'washed' as const,
          variety: "Caturra, Castillo",
          purchase_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          roast_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          supplier: "Blue Bottle Coffee",
          cost: 16.00,
          total_grams: 250,
          remaining_grams: 175,
          roast_level: 'medium' as const,
          tasting_notes: ["chocolate", "caramel", "nuts", "balanced"],
          official_description: "Well-balanced Colombian coffee with notes of chocolate and caramel.",
          my_notes: "Great daily drinker. Works well in both pour-over and French press.",
          rating: 4
        },
        {
          name: "Kenya AA Nyeri",
          origin: "Kenya",
          region: "Nyeri",
          farm: "Gachatha-ini Cooperative", 
          altitude: 1700,
          process: 'washed' as const,
          variety: "SL28, SL34",
          purchase_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          roast_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          supplier: "Intelligentsia Coffee",
          cost: 22.00,
          total_grams: 340,
          remaining_grams: 320,
          roast_level: 'medium-light' as const,
          tasting_notes: ["black currant", "wine-like", "bright acidity", "complex"],
          official_description: "Classic Kenya AA with signature black currant notes and wine-like complexity.",
          my_notes: "Intense black currant flavor. Beautiful in V60 but need to dial in the grind.",
          rating: 5
        },
        {
          name: "Brazil Santos Natural",
          origin: "Brazil",
          region: "Cerrado Mineiro",
          farm: "Fazenda Santa Barbara",
          altitude: 1200,
          process: 'natural' as const,
          variety: "Catuai Yellow",
          purchase_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          roast_date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          supplier: "Stumptown Coffee Roasters",
          cost: 14.50,
          total_grams: 340,
          remaining_grams: 85,
          roast_level: 'medium' as const,
          tasting_notes: ["nutty", "chocolate", "low acidity", "smooth"],
          official_description: "Classic Brazilian profile with low acidity and smooth chocolate notes.",
          my_notes: "Getting a bit stale but still decent for cold brew. Should finish this soon.",
          rating: 3
        }
      ];

      let beansCreated = 0;
      for (const bean of sampleBeans) {
        const result = await BeansService.createBean(bean);
        if (result.success) {
          beansCreated++;
        }
      }
      
      if (beansCreated > 0) {
        toast.success(`Created ${beansCreated} sample beans`);
      }

      // Refresh the data
      await loadInventoryData();
      
    } catch (error) {
      console.error('Error populating sample data:', error);
      toast.error('Failed to create sample data');
    }
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
    },
    {
      id: 'sample-data',
      title: 'Create Sample Data',
      icon: 'data',
      onPress: () => {
        setShowActionSheet(false);
        populateSampleData();
      }
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
                      : 'Refine search criteria: name, supplier, origin, variety, or process method'
                    )
                  : activeTab === 'brewers'
                  ? (brewers.length === 0
                      ? 'Add your first brewing equipment to begin tracking brewing parameters'
                      : 'Refine search criteria: name, brand, model, type, or notes'
                    )
                  : (grinders.length === 0
                      ? 'Add your first grinder to begin tracking grind profiles and consistency'
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
                  
                  const freshnessColor = freshnessStatus === 'peak' ? colors.success :
                    freshnessStatus === 'good' ? colors.success :
                    freshnessStatus === 'fading' ? colors.warning :
                    freshnessStatus === 'stale' ? colors.error : colors.textSecondary;

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
                            {bean.supplier || 'Independent Roaster'}
                          </ThemedText>
                        </View>
                        <View style={styles.itemStatus}>
                          <ThemedText style={[styles.statusText, { color: freshnessColor }]}>
                            {freshnessStatus.toUpperCase()}
                          </ThemedText>
                          <ThemedText style={[styles.itemWeight, { color: colors.text }]}>
                            {bean.remaining_grams || 0}g
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
                  const conditionColor = colors.success; // Default to good condition

                  return (
                    <TouchableOpacity
                      key={brewer.id}
                      style={[styles.itemCard, { 
                        backgroundColor: colors.cardBackground,
                        borderLeftColor: conditionColor,
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
                          <ThemedText style={[styles.conditionText, { color: conditionColor }]}>
                            ACTIVE
                          </ThemedText>
                        </View>
                      </View>
                      
                      <View style={styles.itemDetails}>
                        <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                          {brewer.type.charAt(0).toUpperCase() + brewer.type.slice(1).replace('-', ' ')} • {brewer.material || 'Standard'}
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
                  const conditionColor = colors.success; // Default to good condition

                  return (
                    <TouchableOpacity
                      key={grinder.id}
                      style={[styles.itemCard, { 
                        backgroundColor: colors.cardBackground,
                        borderLeftColor: conditionColor,
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
                          <ThemedText style={[styles.conditionText, { color: conditionColor }]}>
                            ACTIVE
                          </ThemedText>
                        </View>
                      </View>
                      
                      <View style={styles.itemDetails}>
                        <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                          {grinder.type.charAt(0).toUpperCase() + grinder.type.slice(1).replace('-', ' ')} • {grinder.burr_material || 'Steel'}
                        </ThemedText>
                        {grinder.burr_size && (
                          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                            {grinder.burr_size}mm burr set
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