import React, { useCallback, useState } from 'react';
import { RefreshControl, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { DataLayout, DataGrid, DataSection } from '@/components/ui/DataLayout';
import { DataCard } from '@/components/ui/DataCard';
import { DataMetric, TimeMetric } from '@/components/ui/DataMetric';
import { DataText } from '@/components/ui/DataText';
import { DataButton } from '@/components/ui/DataButton';
import { getTheme } from '@/constants/DataFirstDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BrewprintsService, type Brewprint } from '@/lib/services';
import { toast } from 'sonner-native';

export default function BrewprintsTab() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');
  const [brewprints, setBrewprints] = useState<Brewprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'experimenting' | 'final' | 'archived'>('all');

  const loadBrewprints = useCallback(async () => {
    try {
      const result = await BrewprintsService.getAllBrewprints();
      if (result.success && result.data) {
        setBrewprints(result.data);
      } else {
        toast.error('Failed to load recipes');
      }
    } catch {
      toast.error('Error loading recipes');
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

  // Filter and organize data
  const getFilteredBrewprints = (): Brewprint[] => {
    if (activeFilter === 'all') return brewprints;
    return brewprints.filter((b) => b.status === activeFilter);
  };

  const getCounts = () => {
    return {
      total: brewprints.length,
      experimenting: brewprints.filter((b) => b.status === 'experimenting').length,
      final: brewprints.filter((b) => b.status === 'final').length,
      archived: brewprints.filter((b) => b.status === 'archived').length,
    };
  };

  const filteredBrewprints = getFilteredBrewprints();
  const counts = getCounts();

  const handleBrewprintPress = (brewprint: Brewprint) => {
    if (Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/brewprints/${brewprint.id}`);
  };

  const handleNewBrewprint = () => {
    if (Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/brewprints/new');
  };

  const renderFilterTabs = () => {
    const filters = [
      { key: 'all' as const, label: 'All', count: counts.total },
      { key: 'experimenting' as const, label: 'Testing', count: counts.experimenting },
      { key: 'final' as const, label: 'Final', count: counts.final },
      { key: 'archived' as const, label: 'Archived', count: counts.archived },
    ];

    return (
      <View style={{
        flexDirection: 'row',
        gap: theme.spacing[2],
        marginBottom: theme.spacing[6],
      }}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={{
              flex: 1,
              paddingVertical: theme.spacing[2],
              paddingHorizontal: theme.spacing[3],
              borderRadius: theme.layout.card.radius.md,
              backgroundColor: activeFilter === filter.key 
                ? theme.colors.interactive.default 
                : theme.colors.surface,
              borderWidth: 1,
              borderColor: activeFilter === filter.key 
                ? theme.colors.interactive.default 
                : theme.colors.border,
              alignItems: 'center',
            }}
            onPress={() => {
              if (Haptics.impactAsync) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setActiveFilter(filter.key);
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${filter.label}, ${filter.count} recipes`}
          >
            <DataText
              variant="small"
              color={activeFilter === filter.key ? 'inverse' : 'secondary'}
              weight="medium"
              style={{ textAlign: 'center' }}
            >
              {filter.label}
            </DataText>
            <DataText
              variant="tiny"
              color={activeFilter === filter.key ? 'inverse' : 'tertiary'}
              weight="medium"
              style={{ textAlign: 'center' }}
            >
              {filter.count}
            </DataText>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <DataLayout title="Recipes" subtitle="Loading your brewing recipes...">
        <DataCard>
          <DataText variant="body" color="secondary">
            Loading recipes...
          </DataText>
        </DataCard>
      </DataLayout>
    );
  }

  return (
    <DataLayout
      title="Recipes"
      subtitle={`${filteredBrewprints.length} recipe${filteredBrewprints.length === 1 ? '' : 's'} available`}
      scrollable
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
    >
      {/* Quick Action */}
      <DataSection spacing="lg">
        <DataButton
          title="Create New Recipe"
          onPress={handleNewBrewprint}
          variant="primary"
          size="lg"
          fullWidth
          accessibilityHint="Create a new brewing recipe"
        />
      </DataSection>

      {/* Filter Tabs */}
      <DataSection title="Filter Recipes" spacing="lg">
        {renderFilterTabs()}
      </DataSection>

      {/* Recipe List */}
      {filteredBrewprints.length === 0 ? (
        <DataSection title="No Recipes Found" spacing="lg">
          <DataCard variant="bordered">
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing[8] }}>
              <DataText variant="h3" color="primary" weight="semibold" style={{ marginBottom: theme.spacing[2] }}>
                {activeFilter === 'all' ? 'No Recipes Yet' : `No ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Recipes`}
              </DataText>
              <DataText variant="body" color="secondary" style={{ textAlign: 'center', marginBottom: theme.spacing[6] }}>
                {activeFilter === 'all' 
                  ? 'Create your first brewing recipe to get started'
                  : `Create and organize recipes in different categories`
                }
              </DataText>
              <DataButton
                title="Create First Recipe"
                onPress={handleNewBrewprint}
                variant="primary"
                size="md"
              />
            </View>
          </DataCard>
        </DataSection>
      ) : (
        <DataSection title={`${activeFilter === 'all' ? 'All' : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Recipes`} spacing="lg">
          <DataGrid columns={1} gap="md">
            {filteredBrewprints.map((brewprint) => (
              <DataCard
                key={brewprint.id}
                onPress={() => handleBrewprintPress(brewprint)}
                variant="default"
                accessibilityLabel={`Recipe: ${brewprint.name}`}
                accessibilityHint="Tap to view recipe details"
              >
                {/* Recipe Header */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: theme.spacing[4],
                }}>
                  <View style={{ flex: 1, marginRight: theme.spacing[3] }}>
                    <DataText variant="h4" color="primary" weight="semibold" style={{ marginBottom: theme.spacing[1] }}>
                      {brewprint.name}
                    </DataText>
                    <DataText variant="small" color="secondary">
                      {brewprint.method
                        ? brewprint.method.charAt(0).toUpperCase() + brewprint.method.slice(1).replace('-', ' ')
                        : 'Unknown Method'}
                    </DataText>
                  </View>
                  
                  {/* Status Badge */}
                  <View
                    style={{
                      paddingHorizontal: theme.spacing[2],
                      paddingVertical: theme.spacing[1],
                      borderRadius: theme.layout.card.radius.sm,
                      backgroundColor: 
                        brewprint.status === 'final'
                          ? theme.colors.success
                          : brewprint.status === 'experimenting'
                          ? theme.colors.warning
                          : theme.colors.data.secondary,
                    }}
                  >
                    <DataText variant="tiny" color="inverse" weight="medium">
                      {brewprint.status?.toUpperCase() || 'DRAFT'}
                    </DataText>
                  </View>
                </View>

                {/* Key Parameters */}
                <View style={{
                  flexDirection: 'row',
                  gap: theme.spacing[4],
                  marginBottom: theme.spacing[4],
                }}>
                  <DataMetric
                    label="Coffee"
                    value={brewprint.parameters?.coffee_grams || '?'}
                    unit="g"
                    size="sm"
                  />
                  <DataMetric
                    label="Water"
                    value={brewprint.parameters?.water_grams || '?'}
                    unit="g"
                    size="sm"
                  />
                  <TimeMetric
                    label="Time"
                    seconds={brewprint.parameters?.total_time || 0}
                    size="sm"
                  />
                  <DataMetric
                    label="Temp"
                    value={brewprint.parameters?.water_temp || '?'}
                    unit="°C"
                    size="sm"
                  />
                </View>

                {/* Description */}
                {brewprint.description && (
                  <View style={{ 
                    paddingTop: theme.spacing[3],
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.borderLight,
                  }}>
                    <DataText variant="small" color="secondary" numberOfLines={2}>
                      {brewprint.description}
                    </DataText>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={{
                  flexDirection: 'row',
                  gap: theme.spacing[2],
                  marginTop: theme.spacing[4],
                }}>
                  <DataButton
                    title="Start Brewing"
                    variant="primary"
                    size="sm"
                    onPress={() => {
                      if (Haptics.impactAsync) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      if (!brewprint.id) {
                        toast.error('Recipe ID missing - cannot start brewing session');
                        return;
                      }
                      router.push(`/brewing/${brewprint.id}`);
                    }}
                    style={{ flex: 1 }}
                  />
                  <DataButton
                    title="Duplicate"
                    variant="secondary"
                    size="sm"
                    onPress={() => {
                      if (Haptics.impactAsync) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
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
                    style={{ flex: 1 }}
                  />
                </View>
              </DataCard>
            ))}
          </DataGrid>
        </DataSection>
      )}
    </DataLayout>
  );
}