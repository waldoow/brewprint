import React, { useCallback, useState } from 'react';
import { RefreshControl, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  View,
  Text,
  TouchableOpacity as UITouchableOpacity,
} from 'react-native-ui-lib';
import { BrewprintsService, type Brewprint } from '@/lib/services';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { toast } from 'sonner-native';

export default function BrewprintsTab() {
  const [brewprints, setBrewprints] = useState<Brewprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'experimenting' | 'final' | 'archived'>('all');
  
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

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
    pageTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    pageSubtitle: {
      fontSize: 11,
      color: theme.colors.text.secondary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 32,
      gap: 32,
    },
    createButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
    },
    createButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    section: {
      gap: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    filterTabs: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 6,
      overflow: 'hidden',
    },
    filterTab: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },
    activeFilterTab: {
      backgroundColor: theme.colors.surface,
    },
    firstTab: {
      borderTopLeftRadius: 6,
      borderBottomLeftRadius: 6,
    },
    lastTab: {
      borderRightWidth: 0,
      borderTopRightRadius: 6,
      borderBottomRightRadius: 6,
    },
    filterTabText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      marginBottom: 2,
    },
    activeFilterTabText: {
      color: theme.colors.text.primary,
    },
    filterTabCount: {
      fontSize: 10,
      color: theme.colors.text.tertiary,
    },
    activeFilterTabCount: {
      color: theme.colors.text.secondary,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
      paddingHorizontal: 24,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 18,
    },
    emptyButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
    },
    emptyButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    recipeItem: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    lastRecipeItem: {
      borderBottomWidth: 0,
    },
    recipeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    recipeInfo: {
      flex: 1,
      marginRight: 12,
    },
    recipeName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    recipeMethod: {
      fontSize: 11,
      color: theme.colors.text.secondary,
    },
    statusBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 3,
      backgroundColor: theme.colors.surface,
    },
    finalBadge: {
      backgroundColor: theme.colors.success,
    },
    experimentingBadge: {
      backgroundColor: theme.colors.warning,
    },
    draftBadge: {
      backgroundColor: theme.colors.surface,
    },
    statusBadgeText: {
      fontSize: 8,
      fontWeight: '600',
      color: theme.colors.text.inverse,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    parametersRow: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 12,
    },
    parameter: {
      minWidth: 60,
    },
    parameterLabel: {
      fontSize: 9,
      color: theme.colors.text.tertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    parameterValue: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    descriptionSection: {
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      marginBottom: 12,
    },
    description: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      lineHeight: 16,
    },
    actionRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 4,
      alignItems: 'center',
      borderWidth: 1,
    },
    primaryActionButton: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    secondaryActionButton: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
    },
    primaryActionText: {
      fontSize: 11,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    secondaryActionText: {
      fontSize: 11,
      fontWeight: '500',
      color: theme.colors.text.secondary,
    },
  });

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
      <View style={styles.filterTabs}>
        {filters.map((filter, index) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              activeFilter === filter.key && styles.activeFilterTab,
              index === 0 && styles.firstTab,
              index === filters.length - 1 && styles.lastTab,
            ]}
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
            <Text style={[
              styles.filterTabText,
              activeFilter === filter.key && styles.activeFilterTabText
            ]}>
              {filter.label}
            </Text>
            <Text style={[
              styles.filterTabCount,
              activeFilter === filter.key && styles.activeFilterTabCount
            ]}>
              {filter.count}
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
            Recipes
          </Text>
          <Text style={styles.pageSubtitle}>
            Loading your brewing recipes...
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Loading recipes...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>
          Recipes
        </Text>
        <Text style={styles.pageSubtitle}>
          {filteredBrewprints.length} recipe{filteredBrewprints.length === 1 ? '' : 's'} available
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* Create Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleNewBrewprint}
          activeOpacity={0.7}
        >
          <Text style={styles.createButtonText}>
            Create New Recipe
          </Text>
        </TouchableOpacity>

        {/* Filter Tabs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Filter Recipes
          </Text>
          {renderFilterTabs()}
        </View>

        {/* Recipe List */}
        {filteredBrewprints.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {activeFilter === 'all' ? 'No Recipes Yet' : `No ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Recipes`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'all' 
                ? 'Create your first brewing recipe to get started'
                : `Create and organize recipes in different categories`
              }
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleNewBrewprint}
              activeOpacity={0.7}
            >
              <Text style={styles.emptyButtonText}>
                Create First Recipe
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {activeFilter === 'all' ? 'All' : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Recipes
            </Text>
            <View>
              {filteredBrewprints.map((brewprint, index) => (
                <TouchableOpacity
                  key={brewprint.id}
                  style={[
                    styles.recipeItem,
                    index === filteredBrewprints.length - 1 && styles.lastRecipeItem
                  ]}
                  onPress={() => handleBrewprintPress(brewprint)}
                  activeOpacity={0.7}
                  accessibilityLabel={`Recipe: ${brewprint.name}`}
                  accessibilityHint="Tap to view recipe details"
                >
                  {/* Recipe Header */}
                  <View style={styles.recipeHeader}>
                    <View style={styles.recipeInfo}>
                      <Text style={styles.recipeName}>
                        {brewprint.name}
                      </Text>
                      <Text style={styles.recipeMethod}>
                        {brewprint.method
                          ? brewprint.method.charAt(0).toUpperCase() + brewprint.method.slice(1).replace('-', ' ')
                          : 'Unknown Method'}
                      </Text>
                    </View>
                    
                    {/* Status Badge */}
                    <View style={[
                      styles.statusBadge,
                      brewprint.status === 'final' && styles.finalBadge,
                      brewprint.status === 'experimenting' && styles.experimentingBadge,
                      !brewprint.status && styles.draftBadge,
                    ]}>
                      <Text style={styles.statusBadgeText}>
                        {brewprint.status?.toUpperCase() || 'DRAFT'}
                      </Text>
                    </View>
                  </View>

                  {/* Key Parameters */}
                  <View style={styles.parametersRow}>
                    <View style={styles.parameter}>
                      <Text style={styles.parameterLabel}>Coffee</Text>
                      <Text style={styles.parameterValue}>
                        {brewprint.parameters?.coffee_grams || '?'}g
                      </Text>
                    </View>
                    <View style={styles.parameter}>
                      <Text style={styles.parameterLabel}>Water</Text>
                      <Text style={styles.parameterValue}>
                        {brewprint.parameters?.water_grams || '?'}g
                      </Text>
                    </View>
                    <View style={styles.parameter}>
                      <Text style={styles.parameterLabel}>Time</Text>
                      <Text style={styles.parameterValue}>
                        {Math.floor((brewprint.parameters?.total_time || 0) / 60)}:{String((brewprint.parameters?.total_time || 0) % 60).padStart(2, '0')}
                      </Text>
                    </View>
                    <View style={styles.parameter}>
                      <Text style={styles.parameterLabel}>Temp</Text>
                      <Text style={styles.parameterValue}>
                        {brewprint.parameters?.water_temp || '?'}°C
                      </Text>
                    </View>
                  </View>

                  {/* Description */}
                  {brewprint.description && (
                    <View style={styles.descriptionSection}>
                      <Text style={styles.description} numberOfLines={2}>
                        {brewprint.description}
                      </Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.primaryActionButton]}
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
                      activeOpacity={0.7}
                    >
                      <Text style={styles.primaryActionText}>
                        Start Brewing
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.secondaryActionButton]}
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
                      activeOpacity={0.7}
                    >
                      <Text style={styles.secondaryActionText}>
                        Duplicate
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}