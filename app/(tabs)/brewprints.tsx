import React, { useCallback, useState } from 'react';
import { RefreshControl, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
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
      <Container>
        <PageHeader title="Brewing Recipes" />
        <View style={styles.loadingContainer}>
          <Text variant="body" color="secondary">
            Loading recipes...
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container 
      scrollable 
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      <Section 
        title="Your Recipe Collection"
        subtitle={`${filteredBrewprints.length} recipe${
          filteredBrewprints.length === 1 ? '' : 's'
        } ready to brew`}
        spacing="xl"
      >
        <Button
          title="Create New Recipe"
          variant="secondary"
          size="lg"
          fullWidth
          onPress={handleNewBrewprint}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
        />
      </Section>

      <Section 
        title="Filter by Status"
        spacing="lg"
      >
        <Card variant="elevated" style={{ marginBottom: 16 }}>
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
              <Text
                variant="caption"
                weight="medium"
                color={activeTab === tab.key ? 'inverse' : 'secondary'}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        </Card>
      </Section>

      {filteredBrewprints.length === 0 ? (
        <Section 
          title="Start Your Journey"
          subtitle="Create your first recipe to begin brewing excellence"
          variant="elevated"
          spacing="xl"
        >
          <Card variant="outlined" style={{ alignItems: 'center', padding: 24 }}>
            <Text 
              variant="2xl" 
              weight="bold" 
              style={{ textAlign: 'center', marginBottom: 12 }}
            >
              {getEmptyMessage().title}
            </Text>
            <Text 
              variant="lg" 
              color="secondary" 
              style={{ textAlign: 'center', marginBottom: 32 }}
            >
              {getEmptyMessage().description}
            </Text>
            <Button
              title="Create Your First Recipe"
              onPress={handleNewBrewprint}
              variant="primary"
              size="lg"
              fullWidth
            />
          </Card>
        </Section>
      ) : (
        <Section 
          title="Your Brewing Arsenal"
          subtitle="Perfected recipes ready for your next cup"
          spacing="xl"
        >
          {filteredBrewprints.map((brewprint) => (
            <Card
              key={brewprint.id}
              variant="default"
              onPress={() => handleBrewprintPress(brewprint)}
            >
              <View style={styles.recipeHeader}>
                <View style={{ flex: 1 }}>
                  <Text variant="h4" weight="semibold">
                    {brewprint.name}
                  </Text>
                  <Text variant="caption" color="secondary">
                    {brewprint.method
                      ? brewprint.method.charAt(0).toUpperCase() +
                        brewprint.method.slice(1).replace('-', ' ')
                      : 'Unknown Method'}
                  </Text>
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
                  <Text variant="caption" color="inverse">
                    {brewprint.status?.toUpperCase() || 'DRAFT'}
                  </Text>
                </View>
              </View>

              <View style={styles.recipeParams}>
                <View style={styles.paramRow}>
                  <Text variant="caption" color="secondary">
                    Coffee Dose
                  </Text>
                  <Text variant="caption" weight="medium">
                    {brewprint.parameters?.coffee_grams || 'Unknown'}g
                  </Text>
                </View>
                
                <View style={styles.paramRow}>
                  <Text variant="caption" color="secondary">
                    Water Temp
                  </Text>
                  <Text variant="caption" weight="medium">
                    {brewprint.parameters?.water_temp || 'Unknown'}°C
                  </Text>
                </View>
                
                <View style={styles.paramRow}>
                  <Text variant="caption" color="secondary">
                    Brew Time
                  </Text>
                  <Text variant="caption" weight="medium">
                    {brewprint.parameters?.total_time
                      ? `${Math.floor(brewprint.parameters.total_time / 60)}:${(
                          brewprint.parameters.total_time % 60
                        )
                          .toString()
                          .padStart(2, '0')}`
                      : 'Unknown'}
                  </Text>
                </View>
              </View>

              {brewprint.description && (
                <View style={styles.descriptionContainer}>
                  <Text 
                    variant="caption" 
                    color="secondary"
                    style={{ lineHeight: 16 }}
                    numberOfLines={2}
                  >
                    {brewprint.description}
                  </Text>
                </View>
              )}

              <View style={styles.actionRow}>
                <Button
                  title="Start Brewing"
                  variant="primary"
                  size="sm"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/brewing/${brewprint.id}`);
                  }}
                  style={{ flex: 1, marginRight: 8 }}
                />
                
                <Button
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
            </Card>
          ))}
        </Section>
      )}
    </Container>
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
