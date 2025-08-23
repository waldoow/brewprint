import React, { useCallback, useState } from 'react';
import { RefreshControl, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ProfessionalContainer } from '@/components/ui/professional/Container';
import { ProfessionalHeader } from '@/components/ui/professional/Header';
import { ProfessionalCard } from '@/components/ui/professional/Card';
import { ProfessionalText } from '@/components/ui/professional/Text';
import { ProfessionalButton } from '@/components/ui/professional/Button';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BrewprintsService, type Brewprint } from '@/lib/services';
import { toast } from 'sonner-native';

export default function BrewprintsTab() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');
  const [brewprints, setBrewprints] = useState<Brewprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const loadBrewprints = useCallback(async () => {
    try {
      const result = await BrewprintsService.getAllBrewprints();
      if (result.success && result.data) {
        setBrewprints(result.data);
      } else {
        toast.error('Failed to load brewing recipes');
      }
    } catch (error) {
      toast.error('An error occurred while loading recipes');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBrewprints();
    }, [loadBrewprints])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadBrewprints();
  }, [loadBrewprints]);

  const getFilteredBrewprints = (): Brewprint[] => {
    let filtered = brewprints;

    // Filter by tab
    switch (activeTab) {
      case 'experimenting':
        filtered = filtered.filter((b) => b.status === 'experimenting');
        break;
      case 'final':
        filtered = filtered.filter((b) => b.status === 'final');
        break;
      case 'archived':
        filtered = filtered.filter((b) => b.status === 'archived');
        break;
    }

    return filtered;
  };

  const getTabCounts = () => {
    const experimenting = brewprints.filter((b) => b.status === 'experimenting').length;
    const final = brewprints.filter((b) => b.status === 'final').length;
    const archived = brewprints.filter((b) => b.status === 'archived').length;

    return { experimenting, final, archived };
  };

  const filteredBrewprints = getFilteredBrewprints();
  const counts = getTabCounts();

  const handleBrewprintPress = (brewprint: Brewprint) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/brewprints/${brewprint.id}`);
  };

  const handleNewBrewprint = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/brewprints/new');
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'experimenting':
        return {
          title: 'No Experimental Recipes',
          description: 'Create your first experimental brewing recipe to begin testing variables',
        };
      case 'final':
        return {
          title: 'No Finalized Recipes',
          description: 'Test your experimental recipes and promote the best ones to finalized status',
        };
      case 'archived':
        return {
          title: 'No Archived Recipes',
          description: 'Archive recipes that you no longer use but want to keep for reference',
        };
      default:
        return {
          title: 'No Brewing Recipes',
          description: 'Create your first brewing recipe to start perfecting your coffee',
        };
    }
  };

  if (isLoading) {
    return (
      <ProfessionalContainer>
        <ProfessionalHeader title="Brewing Recipes" />
        <View style={styles.loadingContainer}>
          <ProfessionalText variant="body" color="secondary">
            Loading recipes...
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
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      <ProfessionalHeader
        title="Brewing Recipes"
        subtitle={`${filteredBrewprints.length} recipe${
          filteredBrewprints.length === 1 ? '' : 's'
        } available`}
        action={{
          title: 'New Recipe',
          onPress: handleNewBrewprint,
        }}
      />

      {/* Status Filter Tabs */}
      <ProfessionalCard variant="outlined" style={{ marginBottom: 16 }}>
        <View style={styles.tabContainer}>
          {[
            { key: 'all', label: `All (${brewprints.length})` },
            { key: 'experimenting', label: `Testing (${counts.experimenting})` },
            { key: 'final', label: `Final (${counts.final})` },
            { key: 'archived', label: `Archived (${counts.archived})` },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && {
                  backgroundColor: theme.colors.gray[900],
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.key);
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

      {filteredBrewprints.length === 0 ? (
        <ProfessionalCard variant="outlined" style={{ flex: 1, justifyContent: 'center' }}>
          <ProfessionalText 
            variant="h4" 
            weight="semibold" 
            style={{ textAlign: 'center', marginBottom: 8 }}
          >
            {getEmptyMessage().title}
          </ProfessionalText>
          <ProfessionalText 
            variant="body" 
            color="secondary" 
            style={{ textAlign: 'center', marginBottom: 24 }}
          >
            {getEmptyMessage().description}
          </ProfessionalText>
          <ProfessionalButton
            title="Create Your First Recipe"
            onPress={handleNewBrewprint}
            variant="primary"
            fullWidth
          />
        </ProfessionalCard>
      ) : (
        <>
          {filteredBrewprints.map((brewprint) => (
            <ProfessionalCard
              key={brewprint.id}
              variant="default"
              onPress={() => handleBrewprintPress(brewprint)}
            >
              <View style={styles.recipeHeader}>
                <View style={{ flex: 1 }}>
                  <ProfessionalText variant="h4" weight="semibold">
                    {brewprint.name}
                  </ProfessionalText>
                  <ProfessionalText variant="caption" color="secondary">
                    {brewprint.method
                      ? brewprint.method.charAt(0).toUpperCase() +
                        brewprint.method.slice(1).replace('-', ' ')
                      : 'Unknown Method'}
                  </ProfessionalText>
                </View>
                
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        brewprint.status === 'final'
                          ? theme.colors.success
                          : brewprint.status === 'experimenting'
                          ? theme.colors.warning
                          : theme.colors.gray[400],
                    },
                  ]}
                >
                  <ProfessionalText variant="caption" color="inverse">
                    {brewprint.status?.toUpperCase() || 'DRAFT'}
                  </ProfessionalText>
                </View>
              </View>

              <View style={styles.recipeParams}>
                <View style={styles.paramRow}>
                  <ProfessionalText variant="caption" color="secondary">
                    Coffee Dose
                  </ProfessionalText>
                  <ProfessionalText variant="caption" weight="medium">
                    {brewprint.parameters?.coffee_grams || 'Unknown'}g
                  </ProfessionalText>
                </View>
                
                <View style={styles.paramRow}>
                  <ProfessionalText variant="caption" color="secondary">
                    Water Temp
                  </ProfessionalText>
                  <ProfessionalText variant="caption" weight="medium">
                    {brewprint.parameters?.water_temp || 'Unknown'}°C
                  </ProfessionalText>
                </View>
                
                <View style={styles.paramRow}>
                  <ProfessionalText variant="caption" color="secondary">
                    Brew Time
                  </ProfessionalText>
                  <ProfessionalText variant="caption" weight="medium">
                    {brewprint.parameters?.total_time
                      ? `${Math.floor(brewprint.parameters.total_time / 60)}:${(
                          brewprint.parameters.total_time % 60
                        )
                          .toString()
                          .padStart(2, '0')}`
                      : 'Unknown'}
                  </ProfessionalText>
                </View>
              </View>

              {brewprint.description && (
                <View style={styles.descriptionContainer}>
                  <ProfessionalText 
                    variant="caption" 
                    color="secondary"
                    style={{ lineHeight: 16 }}
                    numberOfLines={2}
                  >
                    {brewprint.description}
                  </ProfessionalText>
                </View>
              )}

              <View style={styles.actionRow}>
                <ProfessionalButton
                  title="Start Brewing"
                  variant="primary"
                  size="sm"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/brewing/${brewprint.id}`);
                  }}
                  style={{ flex: 1, marginRight: 8 }}
                />
                
                <ProfessionalButton
                  title="Duplicate"
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({
                      pathname: '/brewprints/new',
                      params: {
                        template: JSON.stringify({
                          name: `${brewprint.name} (Copy)`,
                          description: brewprint.description,
                          method: brewprint.method,
                          difficulty: brewprint.difficulty || 1,
                          parameters: brewprint.parameters,
                          steps: brewprint.steps || [],
                          bean_id: brewprint.bean_id,
                          grinder_id: brewprint.grinder_id,
                          brewer_id: brewprint.brewer_id,
                          water_profile_id: brewprint.water_profile_id,
                        }),
                      },
                    });
                  }}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </ProfessionalCard>
          ))}
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
  
  recipeHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center' as const,
  },
  
  recipeParams: {
    gap: 6,
    marginBottom: 12,
  },
  
  paramRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  
  descriptionContainer: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(156, 163, 175, 0.2)',
  },
  
  actionRow: {
    flexDirection: 'row' as const,
    marginTop: 16,
  },
};
