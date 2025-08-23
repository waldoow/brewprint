import React, { useState, useEffect, useMemo } from 'react';
import { RefreshControl, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ProfessionalContainer } from '@/components/ui/professional/Container';
import { ProfessionalHeader } from '@/components/ui/professional/Header';
import { ProfessionalCard } from '@/components/ui/professional/Card';
import { ProfessionalText } from '@/components/ui/professional/Text';
import { ProfessionalButton } from '@/components/ui/professional/Button';
import { getTheme } from '@/constants/ProfessionalDesign';
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
  const [activeTab, setActiveTab] = useState<'beans' | 'brewers' | 'grinders'>('beans');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      }
      
      if (brewersResult.success && brewersResult.data) {
        setBrewers(brewersResult.data);
      }

      if (grindersResult.success && grindersResult.data) {
        setGrinders(grindersResult.data);
      }
      
      if (!beansResult.success && !brewersResult.success && !grindersResult.success) {
        toast.error('Failed to load inventory');
      }
    } catch (error) {
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

  // Sort inventory data by freshness and name
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

  const handleAddItem = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (activeTab === 'beans') {
      router.push('/beans/new');
    } else if (activeTab === 'brewers') {
      router.push('/brewers/new');
    } else {
      router.push('/grinders/new');
    }
  };

  const handleBeanPress = (beanId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/bean-detail/${beanId}`);
  };
  
  const handleBrewerPress = (brewerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/brewer-detail/${brewerId}`);
  };

  const handleGrinderPress = (grinderId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/grinder-detail/${grinderId}`);
  };

  const currentData = activeTab === 'beans' ? inventoryData.beans : 
                     activeTab === 'brewers' ? inventoryData.brewers : 
                     inventoryData.grinders;

  if (loading) {
    return (
      <ProfessionalContainer>
        <ProfessionalHeader title="Equipment Library" />
        <View style={styles.loadingContainer}>
          <ProfessionalText variant="body" color="secondary">
            Loading inventory...
          </ProfessionalText>
        </View>
      </ProfessionalContainer>
    );
  }

  return (
    <ProfessionalContainer 
      scrollable 
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      <ProfessionalHeader
        title="Equipment Library"
        subtitle={`${currentData.length} ${activeTab}`}
        action={{
          title: `Add ${activeTab === 'beans' ? 'Bean' : activeTab === 'brewers' ? 'Brewer' : 'Grinder'}`,
          onPress: handleAddItem,
        }}
      />

      {/* Category Tabs */}
      <ProfessionalCard variant="outlined" style={{ marginBottom: 16 }}>
        <View style={styles.tabContainer}>
          {[
            { key: 'beans', label: `Beans (${inventoryData.beans.length})` },
            { key: 'brewers', label: `Brewers (${inventoryData.brewers.length})` },
            { key: 'grinders', label: `Grinders (${inventoryData.grinders.length})` },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.key as 'beans' | 'brewers' | 'grinders');
              }}
            >
              <ProfessionalText
                variant="caption"
                weight="medium"
                color={activeTab === tab.key ? 'inverse' : 'secondary'}
              >
                {tab.label}
              </ProfessionalText>
            </TouchableOpacity>
          ))}
        </View>
      </ProfessionalCard>

      {currentData.length === 0 ? (
        <ProfessionalCard variant="outlined" style={{ flex: 1, justifyContent: 'center' }}>
          <ProfessionalText 
            variant="h4" 
            weight="semibold" 
            style={{ textAlign: 'center', marginBottom: 8 }}
          >
            No {activeTab}
          </ProfessionalText>
          <ProfessionalText 
            variant="body" 
            color="secondary" 
            style={{ textAlign: 'center', marginBottom: 24 }}
          >
            {activeTab === 'beans' 
              ? 'Add your first coffee beans to begin tracking freshness and optimization'
              : activeTab === 'brewers'
              ? 'Add your first brewing equipment to begin tracking brewing parameters'
              : 'Add your first grinder to begin tracking grind profiles and consistency'
            }
          </ProfessionalText>
          <ProfessionalButton
            title={`Add First ${activeTab === 'beans' ? 'Bean' : activeTab === 'brewers' ? 'Brewer' : 'Grinder'}`}
            onPress={handleAddItem}
            variant="primary"
            fullWidth
          />
        </ProfessionalCard>
      ) : (
        <>
          {activeTab === 'beans' ? (
            inventoryData.beans.map((bean) => {
              const freshnessDays = bean.roast_date ? 
                Math.floor((new Date().getTime() - new Date(bean.roast_date).getTime()) / (1000 * 60 * 60 * 24)) : null;
              
              const freshnessStatus = freshnessDays === null ? 'unknown' :
                freshnessDays <= 7 ? 'peak' : 
                freshnessDays <= 14 ? 'good' : 
                freshnessDays <= 21 ? 'fading' : 'stale';
              
              const freshnessColor = freshnessStatus === 'peak' ? theme.colors.success :
                freshnessStatus === 'good' ? theme.colors.success :
                freshnessStatus === 'fading' ? theme.colors.warning :
                freshnessStatus === 'stale' ? theme.colors.error : theme.colors.gray[400];

              return (
                <ProfessionalCard
                  key={bean.id}
                  variant="default"
                  onPress={() => handleBeanPress(bean.id)}
                >
                  <View style={styles.itemHeader}>
                    <View style={{ flex: 1 }}>
                      <ProfessionalText variant="h4" weight="semibold">
                        {bean.name}
                      </ProfessionalText>
                      <ProfessionalText variant="caption" color="secondary">
                        {bean.supplier || 'Independent Roaster'}
                      </ProfessionalText>
                    </View>
                    
                    <View style={styles.itemStatus}>
                      <View style={[styles.statusBadge, { backgroundColor: freshnessColor }]}>
                        <ProfessionalText variant="caption" color="inverse">
                          {freshnessStatus.toUpperCase()}
                        </ProfessionalText>
                      </View>
                      <ProfessionalText variant="body" weight="semibold" style={{ marginTop: 4 }}>
                        {bean.remaining_grams || 0}g
                      </ProfessionalText>
                    </View>
                  </View>

                  <View style={styles.itemDetails}>
                    <ProfessionalText variant="caption" color="secondary">
                      {bean.origin || 'Unknown Origin'} • {bean.roast_level ? bean.roast_level.charAt(0).toUpperCase() + bean.roast_level.slice(1).replace('-', ' ') : 'Unknown Roast'}
                    </ProfessionalText>
                    {freshnessDays !== null && (
                      <ProfessionalText variant="caption" color="secondary">
                        {freshnessDays} days post-roast
                      </ProfessionalText>
                    )}
                  </View>
                </ProfessionalCard>
              );
            })
          ) : activeTab === 'brewers' ? (
            inventoryData.brewers.map((brewer) => (
              <ProfessionalCard
                key={brewer.id}
                variant="default"
                onPress={() => handleBrewerPress(brewer.id)}
              >
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1 }}>
                    <ProfessionalText variant="h4" weight="semibold">
                      {brewer.name}
                    </ProfessionalText>
                    <ProfessionalText variant="caption" color="secondary">
                      {brewer.brand ? `${brewer.brand}${brewer.model ? ` ${brewer.model}` : ''}` : brewer.type.toUpperCase()}
                    </ProfessionalText>
                  </View>
                  
                  <View style={[styles.statusBadge, { backgroundColor: theme.colors.success }]}>
                    <ProfessionalText variant="caption" color="inverse">
                      ACTIVE
                    </ProfessionalText>
                  </View>
                </View>

                <View style={styles.itemDetails}>
                  <ProfessionalText variant="caption" color="secondary">
                    {brewer.type.charAt(0).toUpperCase() + brewer.type.slice(1).replace('-', ' ')} • {brewer.material || 'Standard'}
                  </ProfessionalText>
                  {brewer.capacity_ml && (
                    <ProfessionalText variant="caption" color="secondary">
                      {brewer.capacity_ml}ml capacity
                    </ProfessionalText>
                  )}
                </View>
              </ProfessionalCard>
            ))
          ) : (
            inventoryData.grinders.map((grinder) => (
              <ProfessionalCard
                key={grinder.id}
                variant="default"
                onPress={() => handleGrinderPress(grinder.id)}
              >
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1 }}>
                    <ProfessionalText variant="h4" weight="semibold">
                      {grinder.name}
                    </ProfessionalText>
                    <ProfessionalText variant="caption" color="secondary">
                      {grinder.brand ? `${grinder.brand}${grinder.model ? ` ${grinder.model}` : ''}` : grinder.type.toUpperCase()}
                    </ProfessionalText>
                  </View>
                  
                  <View style={[styles.statusBadge, { backgroundColor: theme.colors.success }]}>
                    <ProfessionalText variant="caption" color="inverse">
                      ACTIVE
                    </ProfessionalText>
                  </View>
                </View>

                <View style={styles.itemDetails}>
                  <ProfessionalText variant="caption" color="secondary">
                    {grinder.type.charAt(0).toUpperCase() + grinder.type.slice(1).replace('-', ' ')} • {grinder.burr_material || 'Steel'}
                  </ProfessionalText>
                  {grinder.burr_size && (
                    <ProfessionalText variant="caption" color="secondary">
                      {grinder.burr_size}mm burr set
                    </ProfessionalText>
                  )}
                </View>
              </ProfessionalCard>
            ))
          )}
        </>
      )}
    </ProfessionalContainer>
  );
}

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 32,
  },
  
  tabContainer: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center' as const,
  },
  
  itemHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  },
  
  itemStatus: {
    alignItems: 'flex-end' as const,
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  
  itemDetails: {
    gap: 4,
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(156, 163, 175, 0.2)',
  },
};