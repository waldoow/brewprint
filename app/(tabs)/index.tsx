import React, { useState, useEffect } from 'react';
import { RefreshControl, View } from 'react-native';
import { router } from 'expo-router';
import { ProfessionalContainer } from '@/components/ui/professional/Container';
import { ProfessionalHeader } from '@/components/ui/professional/Header';
import { ProfessionalDataCard } from '@/components/ui/professional/DataCard';
import { ProfessionalCard } from '@/components/ui/professional/Card';
import { ProfessionalText } from '@/components/ui/professional/Text';
import { ProfessionalButton } from '@/components/ui/professional/Button';
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
    <ProfessionalContainer 
      scrollable 
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ProfessionalHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user?.user_metadata?.username || 'Coffee Enthusiast'}`}
        action={{
          title: "New Recipe",
          onPress: () => router.push('/brewprints/new'),
        }}
      />

      {/* Brewing Overview */}
      <ProfessionalDataCard
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

      {/* Inventory Status */}
      <ProfessionalDataCard
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

      {/* Recipe Development */}
      <ProfessionalDataCard
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

      {/* Quick Actions */}
      <ProfessionalCard variant="elevated">
        <ProfessionalText variant="h4" weight="semibold" style={{ marginBottom: 12 }}>
          Quick Actions
        </ProfessionalText>
        <ProfessionalText variant="body" color="secondary" style={{ marginBottom: 20 }}>
          Start brewing or manage your coffee inventory
        </ProfessionalText>
        
        <ProfessionalButton
          title="Start New Brew"
          onPress={() => router.push('/brewprints')}
          variant="primary"
          fullWidth
          style={{ marginBottom: 12 }}
        />
        
        <ProfessionalButton
          title="Manage Beans"
          onPress={() => router.push('/beans')}
          variant="secondary"
          fullWidth
        />
      </ProfessionalCard>

      {/* Recent Activity */}
      {brewprints.length > 0 && (
        <ProfessionalCard variant="default">
          <ProfessionalText variant="h4" weight="semibold" style={{ marginBottom: 12 }}>
            Recent Recipes
          </ProfessionalText>
          <ProfessionalText variant="body" color="secondary" style={{ marginBottom: 16 }}>
            Your latest brewing experiments
          </ProfessionalText>
          
          {brewprints.slice(0, 3).map((recipe, index) => (
            <ProfessionalCard
              key={recipe.id}
              variant="outlined"
              padding="md"
              onPress={() => router.push(`/brewprints/${recipe.id}`)}
              style={{ marginBottom: index < 2 ? 12 : 0 }}
            >
              <ProfessionalText variant="body" weight="semibold" style={{ marginBottom: 4 }}>
                {recipe.name}
              </ProfessionalText>
              <ProfessionalText variant="caption" color="secondary" style={{ marginBottom: 8 }}>
                {recipe.method?.toUpperCase()} • {recipe.status?.toUpperCase()}
              </ProfessionalText>
              
              {/* Brewing Parameters */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <View style={{ flex: 1 }}>
                  <ProfessionalText variant="caption" color="tertiary">
                    Coffee
                  </ProfessionalText>
                  <ProfessionalText variant="caption" weight="medium">
                    {recipe.parameters?.coffee_grams || 'Unknown'}g
                  </ProfessionalText>
                </View>
                <View style={{ flex: 1 }}>
                  <ProfessionalText variant="caption" color="tertiary">
                    Water
                  </ProfessionalText>
                  <ProfessionalText variant="caption" weight="medium">
                    {recipe.parameters?.water_grams || 'Unknown'}g
                  </ProfessionalText>
                </View>
                <View style={{ flex: 1 }}>
                  <ProfessionalText variant="caption" color="tertiary">
                    Time
                  </ProfessionalText>
                  <ProfessionalText variant="caption" weight="medium">
                    {recipe.parameters?.total_time
                      ? `${Math.floor(recipe.parameters.total_time / 60)}:${(
                          recipe.parameters.total_time % 60
                        )
                          .toString()
                          .padStart(2, '0')}`
                      : 'Unknown'}
                  </ProfessionalText>
                </View>
                <View style={{ flex: 1 }}>
                  <ProfessionalText variant="caption" color="tertiary">
                    Temp
                  </ProfessionalText>
                  <ProfessionalText variant="caption" weight="medium">
                    {recipe.parameters?.water_temp || 'Unknown'}°C
                  </ProfessionalText>
                </View>
              </View>
            </ProfessionalCard>
          ))}
        </ProfessionalCard>
      )}
    </ProfessionalContainer>
  );
}