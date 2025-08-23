import React, { useState, useEffect } from 'react';
import { RefreshControl, View } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataCard } from '@/components/ui/DataCard';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { useAuth } from '@/context/AuthContext';
import { BeansService, type Bean } from '@/lib/services/beans';
import { BrewprintsService, type Brewprint } from '@/lib/services';
import { AnalyticsService, type BrewingStats } from '@/lib/services/analytics';
import { toast } from 'sonner-native';

export default function HomeScreen() {
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
      
      const [beansResult, brewprintsResult, statsResult] = await Promise.all([
        BeansService.getAllBeans(),
        BrewprintsService.getAllBrewprints(),
        AnalyticsService.getBrewingStats(),
      ]);

      if (beansResult.success) setBeans(beansResult.data || []);
      if (brewprintsResult.success) setBrewprints(brewprintsResult.data || []);
      if (statsResult.success) setStats(statsResult.data);
      
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Calculate metrics
  const activeBeans = beans.filter(bean => bean.current_stock && bean.current_stock > 0).length;
  const totalRecipes = brewprints.length;
  const perfectedRecipes = brewprints.filter(r => r.status === 'final').length;
  
  return (
    <Container 
      scrollable 
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Section 
        title="Good Morning"
        subtitle={`Welcome back, ${user?.user_metadata?.username || 'Coffee Enthusiast'}`}
        spacing="xl"
      >
        <Button
          title="Create New Recipe"
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push('/brewprints/new')}
        />
      </Section>

      <Section 
        title="Your Brewing Analytics"
        subtitle="Track your coffee journey with detailed insights"
        spacing="xl"
      >
        <DataCard
          title="Brewing Overview"
          subtitle="Your coffee brewing statistics"
          data={[
            {
              label: 'Total Brews',
              value: stats?.total_brews || 0,
              change: { value: 5, direction: 'up' },
            },
            {
              label: 'Average Rating',
              value: stats?.average_rating || 0,
              unit: '/5',
            },
            {
              label: 'Success Rate',
              value: stats?.success_rate || 0,
              unit: '%',
              change: { value: 3, direction: 'up' },
            },
          ]}
          layout="horizontal"
          variant="elevated"
        />

        <DataCard
          title="Inventory Status"
          subtitle="Current coffee bean stock levels"
          data={[
            {
              label: 'Active Beans',
              value: activeBeans,
              unit: 'types',
            },
            {
              label: 'Total Stock',
              value: beans.reduce((sum, bean) => sum + (bean.current_stock || 0), 0),
              unit: 'g',
            },
            {
              label: 'Low Stock',
              value: beans.filter(bean => (bean.current_stock || 0) < 100).length,
              unit: 'types',
            },
          ]}
          layout="horizontal"
          variant="default"
        />

        <DataCard
          title="Recipe Development"
          subtitle="Recipe creation and refinement progress"
          data={[
            {
              label: 'Total Recipes',
              value: totalRecipes,
            },
            {
              label: 'Perfected',
              value: perfectedRecipes,
              change: { value: 2, direction: 'up' },
            },
            {
              label: 'In Development',
              value: brewprints.filter(r => r.status === 'experimenting').length,
            },
            {
              label: 'Success Rate',
              value: totalRecipes > 0 ? Math.round((perfectedRecipes / totalRecipes) * 100) : 0,
              unit: '%',
            },
          ]}
          layout="grid"
          variant="outlined"
        />
      </Section>

      <Section 
        title="Quick Actions"
        subtitle="Jump into your brewing workflow"
        variant="elevated"
        spacing="xl"
      >
        <View style={{ gap: 16 }}>
          <Button
            title="Start New Brew"
            onPress={() => router.push('/brewprints')}
            variant="primary"
            size="lg"
            fullWidth
          />
          
          <Button
            title="Manage Bean Inventory"
            onPress={() => router.push('/beans')}
            variant="secondary"
            size="lg"
            fullWidth
          />
        </View>
      </Section>

      {brewprints.length > 0 && (
        <Section 
          title="Recent Creations"
          subtitle="Your latest brewing experiments and discoveries"
          variant="elevated"
          spacing="xl"
        >
          <View style={{ gap: 16 }}>
            {brewprints.slice(0, 3).map((recipe, index) => (
              <Card
                key={recipe.id}
                variant="elevated"
                padding="lg"
                onPress={() => router.push(`/brewprints/${recipe.id}`)}
              >
                <Text variant="xl" weight="bold" style={{ marginBottom: 4 }}>
                  {recipe.name}
                </Text>
                <Text variant="body" color="secondary" style={{ marginBottom: 16 }}>
                  {recipe.method?.toUpperCase()} • {recipe.status?.toUpperCase()}
                </Text>
                
                {/* Brewing Parameters */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  backgroundColor: '#F8F9FA',
                  padding: 12,
                  borderRadius: 8,
                }}>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text variant="caption" color="tertiary">
                      Coffee
                    </Text>
                    <Text variant="body" weight="semibold">
                      {recipe.parameters?.coffee_grams || 'Unknown'}g
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text variant="caption" color="tertiary">
                      Water
                    </Text>
                    <Text variant="body" weight="semibold">
                      {recipe.parameters?.water_grams || 'Unknown'}g
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text variant="caption" color="tertiary">
                      Time
                    </Text>
                    <Text variant="body" weight="semibold">
                      {recipe.parameters?.total_time
                        ? `${Math.floor(recipe.parameters.total_time / 60)}:${(
                            recipe.parameters.total_time % 60
                          )
                            .toString()
                            .padStart(2, '0')}`
                        : 'Unknown'}
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text variant="caption" color="tertiary">
                      Temp
                    </Text>
                    <Text variant="body" weight="semibold">
                      {recipe.parameters?.water_temp || 'Unknown'}°C
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </Section>
      )}
    </Container>
  );
}