import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { DataLayout, DataGrid, DataSection } from '@/components/ui/DataLayout';
import { DataCard, InfoCard } from '@/components/ui/DataCard';
import { DataText } from '@/components/ui/DataText';
import { DataButton } from '@/components/ui/DataButton';
import { getTheme } from '@/constants/DataFirstDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BrewersService, type Brewer } from '@/lib/services/brewers';
import { toast } from 'sonner-native';

export default function BrewerDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');
  
  const [brewer, setBrewer] = useState<Brewer | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBrewer = React.useCallback(async () => {
    try {
      setLoading(true);
      const result = await BrewersService.getBrewerById(id as string);
      if (result.success && result.data) {
        setBrewer(result.data);
      } else {
        toast.error('Brewer not found');
      }
    } catch {
      toast.error('Failed to load brewer details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBrewer();
  }, [loadBrewer]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };


  const getConditionLabel = (condition: Brewer['condition']) => {
    switch (condition) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'needs-replacement': return 'Needs Replacement';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <DataLayout
        title="Brewer Details"
        subtitle="Loading equipment information..."
        showBackButton={true}
        onBackPress={() => router.back()}
      >
        <View style={styles.loadingContainer}>
          <DataText variant="body" color="secondary">
            Loading brewer details...
          </DataText>
        </View>
      </DataLayout>
    );
  }

  if (!brewer) {
    return (
      <DataLayout
        title="Brewer Not Found"
        subtitle="Equipment could not be found"
        showBackButton={true}
        onBackPress={() => router.back()}
      >
        <InfoCard
          title="Brewer Not Found"
          message="The requested brewing equipment could not be found in your library."
          variant="error"
          action={{
            title: "Back to Library",
            onPress: () => router.back(),
            variant: "primary"
          }}
        />
      </DataLayout>
    );
  }

  return (
    <DataLayout
      title={brewer.name}
      subtitle={`${brewer.brand || 'Brewing Equipment'} • ${brewer.type.charAt(0).toUpperCase() + brewer.type.slice(1).replace('-', ' ')}`}
      showBackButton={true}
      onBackPress={() => router.back()}
      scrollable
    >
      {/* Equipment Status Overview */}
      <DataSection title="Equipment Status" spacing="lg">
        <DataGrid columns={3} gap="md">
          <DataCard>
            <DataText variant="small" color="secondary" weight="medium">
              Condition
            </DataText>
            <DataText variant="h2" color="primary" weight="bold" style={{ marginVertical: theme.spacing[1] }}>
              {getConditionLabel(brewer.condition)}
            </DataText>
          </DataCard>
          
          {brewer.capacity_ml && (
            <DataCard>
              <DataText variant="small" color="secondary" weight="medium">
                Capacity
              </DataText>
              <DataText variant="h2" color="primary" weight="bold" style={{ marginVertical: theme.spacing[1] }}>
                {brewer.capacity_ml}ml
              </DataText>
            </DataCard>
          )}
          
          {brewer.location && (
            <DataCard>
              <DataText variant="small" color="secondary" weight="medium">
                Location
              </DataText>
              <DataText variant="h2" color="primary" weight="bold" style={{ marginVertical: theme.spacing[1] }}>
                {brewer.location}
              </DataText>
            </DataCard>
          )}
        </DataGrid>
      </DataSection>

      {/* Quick Actions */}
      <DataSection spacing="lg">
        <Link href={`/(tabs)/brewers/edit/${brewer.id}`}>
          <DataButton
            title="Edit Equipment Details"
            variant="primary"
            size="lg"
            fullWidth
          />
        </Link>
      </DataSection>

      {/* Physical Specifications */}
      <DataSection 
        title="Physical Specifications" 
        subtitle="Type, material, and construction details"
        spacing="lg"
      >
        <DataCard>
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <DataText variant="caption" color="secondary">
                Type
              </DataText>
              <DataText variant="caption" weight="medium">
                {brewer.type.charAt(0).toUpperCase() + brewer.type.slice(1).replace('-', ' ')}
              </DataText>
            </View>
            
            {brewer.material && (
              <View style={styles.detailRow}>
                <DataText variant="caption" color="secondary">
                  Material
                </DataText>
                <DataText variant="caption" weight="medium">
                  {brewer.material.charAt(0).toUpperCase() + brewer.material.slice(1)}
                </DataText>
              </View>
            )}
            
            {brewer.filter_type && (
              <View style={styles.detailRow}>
                <DataText variant="caption" color="secondary">
                  Filter Type
                </DataText>
                <DataText variant="caption" weight="medium">
                  {brewer.filter_type}
                </DataText>
              </View>
            )}
            
            {brewer.size && (
              <View style={styles.detailRow}>
                <DataText variant="caption" color="secondary">
                  Size
                </DataText>
                <DataText variant="caption" weight="medium">
                  {brewer.size}
                </DataText>
              </View>
            )}
          </View>
        </DataCard>
      </DataSection>

      {/* Optimal Brewing Parameters */}
      {(brewer.optimal_dose_range || brewer.optimal_ratio_range || 
        brewer.optimal_temp_range || brewer.optimal_grind_range) && (
        <DataSection
          title="Optimal Brewing Parameters"
          subtitle="Recommended settings for best results"
          spacing="lg"
        >
          <DataCard>
            <View style={styles.detailsGrid}>
              {brewer.optimal_dose_range && (
                <View style={styles.detailRow}>
                  <DataText variant="caption" color="secondary">
                    Coffee Dose
                  </DataText>
                  <DataText variant="caption" weight="medium">
                    {brewer.optimal_dose_range[0]}g - {brewer.optimal_dose_range[1]}g
                  </DataText>
                </View>
              )}

              {brewer.optimal_ratio_range && (
                <View style={styles.detailRow}>
                  <DataText variant="caption" color="secondary">
                    Brew Ratio
                  </DataText>
                  <DataText variant="caption" weight="medium">
                    1:{brewer.optimal_ratio_range[0]} - 1:{brewer.optimal_ratio_range[1]}
                  </DataText>
                </View>
              )}

              {brewer.optimal_temp_range && (
                <View style={styles.detailRow}>
                  <DataText variant="caption" color="secondary">
                    Water Temperature
                  </DataText>
                  <DataText variant="caption" weight="medium">
                    {brewer.optimal_temp_range[0]}°C - {brewer.optimal_temp_range[1]}°C
                  </DataText>
                </View>
              )}

              {brewer.optimal_grind_range && (
                <View style={styles.detailRow}>
                  <DataText variant="caption" color="secondary">
                    Grind Setting
                  </DataText>
                  <DataText variant="caption" weight="medium">
                    {brewer.optimal_grind_range[0]} - {brewer.optimal_grind_range[1]}
                  </DataText>
                </View>
              )}
            </View>
          </DataCard>
        </DataSection>
      )}

      {/* Purchase & Maintenance */}
      {(brewer.purchase_date || brewer.purchase_price || brewer.maintenance_schedule || 
        brewer.last_maintenance) && (
        <DataSection
          title="Purchase & Maintenance"
          subtitle="Purchase information and maintenance schedule"
          spacing="lg"
        >
          <DataCard>
            <View style={styles.detailsGrid}>
              {brewer.purchase_date && (
                <View style={styles.detailRow}>
                  <DataText variant="caption" color="secondary">
                    Purchase Date
                  </DataText>
                  <DataText variant="caption" weight="medium">
                    {formatDate(brewer.purchase_date)}
                  </DataText>
                </View>
              )}

              {brewer.purchase_price && (
                <View style={styles.detailRow}>
                  <DataText variant="caption" color="secondary">
                    Purchase Price
                  </DataText>
                  <DataText variant="caption" weight="medium">
                    ${brewer.purchase_price.toFixed(2)}
                  </DataText>
                </View>
              )}

              {brewer.maintenance_schedule && (
                <View style={styles.detailRow}>
                  <DataText variant="caption" color="secondary">
                    Maintenance Schedule
                  </DataText>
                  <DataText variant="caption" weight="medium">
                    {brewer.maintenance_schedule.charAt(0).toUpperCase() + brewer.maintenance_schedule.slice(1)}
                  </DataText>
                </View>
              )}

              {brewer.last_maintenance && (
                <View style={styles.detailRow}>
                  <DataText variant="caption" color="secondary">
                    Last Maintenance
                  </DataText>
                  <DataText variant="caption" weight="medium">
                    {formatDate(brewer.last_maintenance)}
                  </DataText>
                </View>
              )}
            </View>
          </DataCard>
          
          {brewer.maintenance_notes && (
            <DataCard style={{ marginTop: 16 }}>
              <DataText variant="body" weight="medium" style={{ marginBottom: 8 }}>
                Maintenance Notes
              </DataText>
              <DataText variant="body" color="secondary" style={{ lineHeight: 20 }}>
                {brewer.maintenance_notes}
              </DataText>
            </DataCard>
          )}
        </DataSection>
      )}

      {/* Brewing Tips */}
      {brewer.brewing_tips && brewer.brewing_tips.length > 0 && (
        <DataSection
          title="Brewing Tips"
          subtitle="Expert techniques for optimal results"
          spacing="lg"
        >
          <DataCard>
            <View style={styles.tipsGrid}>
              {brewer.brewing_tips.map((tip, index) => (
                <View key={index} style={styles.tipRow}>
                  <DataText variant="body" weight="medium" style={{ color: theme.colors.text.tertiary, marginRight: 8 }}>
                    •
                  </DataText>
                  <DataText variant="body" style={{ flex: 1, lineHeight: 20 }}>
                    {tip}
                  </DataText>
                </View>
              ))}
            </View>
          </DataCard>
        </DataSection>
      )}

      {/* Personal Notes */}
      {brewer.notes && (
        <DataSection
          title="Notes"
          subtitle="Personal observations and preferences"
          spacing="lg"
        >
          <DataCard>
            <DataText variant="body" style={{ lineHeight: 20 }}>
              {brewer.notes}
            </DataText>
          </DataCard>
        </DataSection>
      )}

      {/* Actions */}
      <DataSection
        title="Actions"
        subtitle="Manage equipment or start brewing"
        spacing="xl"
      >
        <DataGrid columns={2} gap="md">
          <Link href={`/(tabs)/brewers/edit/${brewer.id}`}>
            <DataButton
              title="Edit Equipment"
              variant="secondary"
            />
          </Link>
          <Link href={`/brewprints/new?brewer_id=${brewer.id}`}>
            <DataButton
              title="Create Recipe"
              variant="primary"
            />
          </Link>
        </DataGrid>
      </DataSection>
    </DataLayout>
  );
}

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 32,
  },
  
  heroSection: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    overflow: 'hidden' as const,
  },
  
  heroContent: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 28,
  },
  
  statusRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  
  heroStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center' as const,
  },
  
  modernStatusGrid: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    gap: 16,
  },
  
  modernStatusItem: {
    flex: 1,
    alignItems: 'center' as const,
    gap: 8,
  },
  
  modernStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center' as const,
    minWidth: 80,
  },
  
  statusItem: {
    alignItems: 'center' as const,
    gap: 8,
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  
  detailsGrid: {
    gap: 12,
  },
  
  detailRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  
  tipsGrid: {
    gap: 12,
  },
  
  tipRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
  },
  
  actionsRow: {
    flexDirection: 'row' as const,
    gap: 12,
  },
};