import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BrewersService, type Brewer } from '@/lib/services/brewers';
import { toast } from 'sonner-native';

export default function BrewerDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');
  
  const [brewer, setBrewer] = useState<Brewer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrewer();
  }, [id]);

  const loadBrewer = async () => {
    try {
      setLoading(true);
      const result = await BrewersService.getBrewerById(id as string);
      if (result.success && result.data) {
        setBrewer(result.data);
      } else {
        toast.error('Brewer not found');
      }
    } catch (error) {
      toast.error('Failed to load brewer details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getConditionColor = (condition: Brewer['condition']) => {
    switch (condition) {
      case 'excellent': return theme.colors.success;
      case 'good': return theme.colors.success;
      case 'fair': return theme.colors.warning;
      case 'needs-replacement': return theme.colors.error;
      default: return theme.colors.gray[400];
    }
  };

  if (loading) {
    return (
      <Container>
        <PageHeader 
          title="Brewer Details"
          action={{
            title: 'Back',
            onPress: () => router.back(),
          }}
        />
        <View style={styles.loadingContainer}>
          <Text variant="body" color="secondary">
            Loading brewer details...
          </Text>
        </View>
      </Container>
    );
  }

  if (!brewer) {
    return (
      <Container>
        <PageHeader 
          title="Brewer Not Found"
          action={{
            title: 'Back',
            onPress: () => router.back(),
          }}
        />
        <Card variant="outlined" style={{ flex: 1, justifyContent: 'center' }}>
          <Text 
            variant="h4" 
            weight="semibold" 
            style={{ textAlign: 'center', marginBottom: 8 }}
          >
            Brewer Not Found
          </Text>
          <Text 
            variant="body" 
            color="secondary" 
            style={{ textAlign: 'center', marginBottom: 24 }}
          >
            The requested brewer could not be found.
          </Text>
          <Button
            title="Back to Library"
            onPress={() => router.back()}
            variant="primary"
            fullWidth
          />
        </Card>
      </Container>
    );
  }

  return (
    <Container scrollable>
      <Section 
        title={brewer.name}
        subtitle={`${brewer.brand ? `${brewer.brand}${brewer.model ? ` ${brewer.model}` : ''}` : brewer.type.toUpperCase()} • ${brewer.material || 'Standard'}`}
        spacing="xl"
      >
        <Button
          title="Edit Brewer Details"
          variant="secondary"
          size="lg"
          fullWidth
          onPress={() => router.push(`/brewers/edit/${brewer.id}`)}
        />
      </Section>

      <Section 
        title="Status & Condition"
        subtitle="Current condition and location information"
        spacing="lg"
      >
        <Card variant="default">
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text variant="caption" color="secondary">
                Condition
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getConditionColor(brewer.condition) }]}>
                <Text variant="caption" color="inverse">
                  {brewer.condition?.toUpperCase() || 'UNKNOWN'}
                </Text>
              </View>
            </View>
            
            {brewer.location && (
              <View style={styles.statusItem}>
                <Text variant="caption" color="secondary">
                  Location
                </Text>
                <Text variant="body" weight="medium">
                  {brewer.location}
                </Text>
              </View>
            )}
            
            {brewer.capacity_ml && (
              <View style={styles.statusItem}>
                <Text variant="caption" color="secondary">
                  Capacity
                </Text>
                <Text variant="body" weight="medium">
                  {brewer.capacity_ml}ml
                </Text>
              </View>
            )}
          </View>
        </Card>
      </Section>

      <Section
        title="Physical Specifications"
        subtitle="Type, material, and construction details"
        spacing="lg"
      >
        <Card variant="default">
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text variant="caption" color="secondary">
                Type
              </Text>
              <Text variant="caption" weight="medium">
                {brewer.type.charAt(0).toUpperCase() + brewer.type.slice(1).replace('-', ' ')}
              </Text>
            </View>
            
            {brewer.material && (
              <View style={styles.detailRow}>
                <Text variant="caption" color="secondary">
                  Material
                </Text>
                <Text variant="caption" weight="medium">
                  {brewer.material.charAt(0).toUpperCase() + brewer.material.slice(1)}
                </Text>
              </View>
            )}
            
            {brewer.filter_type && (
              <View style={styles.detailRow}>
                <Text variant="caption" color="secondary">
                  Filter Type
                </Text>
                <Text variant="caption" weight="medium">
                  {brewer.filter_type}
                </Text>
              </View>
            )}
            
            {brewer.size && (
              <View style={styles.detailRow}>
                <Text variant="caption" color="secondary">
                  Size
                </Text>
                <Text variant="caption" weight="medium">
                  {brewer.size}
                </Text>
              </View>
            )}
          </View>
        </Card>
      </Section>

      {(brewer.optimal_dose_range || brewer.optimal_ratio_range || 
        brewer.optimal_temp_range || brewer.optimal_grind_range) && (
        <Section
          title="Optimal Brewing Parameters"
          subtitle="Recommended settings for best results"
          spacing="lg"
        >
          <Card variant="default">
            <View style={styles.detailsGrid}>
              {brewer.optimal_dose_range && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Coffee Dose
                  </Text>
                  <Text variant="caption" weight="medium">
                    {brewer.optimal_dose_range[0]}g - {brewer.optimal_dose_range[1]}g
                  </Text>
                </View>
              )}

              {brewer.optimal_ratio_range && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Brew Ratio
                  </Text>
                  <Text variant="caption" weight="medium">
                    1:{brewer.optimal_ratio_range[0]} - 1:{brewer.optimal_ratio_range[1]}
                  </Text>
                </View>
              )}

              {brewer.optimal_temp_range && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Water Temperature
                  </Text>
                  <Text variant="caption" weight="medium">
                    {brewer.optimal_temp_range[0]}°C - {brewer.optimal_temp_range[1]}°C
                  </Text>
                </View>
              )}

              {brewer.optimal_grind_range && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Grind Setting
                  </Text>
                  <Text variant="caption" weight="medium">
                    {brewer.optimal_grind_range[0]} - {brewer.optimal_grind_range[1]}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </Section>
      )}

      {(brewer.purchase_date || brewer.purchase_price || brewer.maintenance_schedule || 
        brewer.last_maintenance) && (
        <Section
          title="Purchase & Maintenance"
          subtitle="Purchase information and maintenance schedule"
          spacing="lg"
        >
          <Card variant="default">
            <View style={styles.detailsGrid}>
              {brewer.purchase_date && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Purchase Date
                  </Text>
                  <Text variant="caption" weight="medium">
                    {formatDate(brewer.purchase_date)}
                  </Text>
                </View>
              )}

              {brewer.purchase_price && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Purchase Price
                  </Text>
                  <Text variant="caption" weight="medium">
                    ${brewer.purchase_price.toFixed(2)}
                  </Text>
                </View>
              )}

              {brewer.maintenance_schedule && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Maintenance Schedule
                  </Text>
                  <Text variant="caption" weight="medium">
                    {brewer.maintenance_schedule.charAt(0).toUpperCase() + brewer.maintenance_schedule.slice(1)}
                  </Text>
                </View>
              )}

              {brewer.last_maintenance && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Last Maintenance
                  </Text>
                  <Text variant="caption" weight="medium">
                    {formatDate(brewer.last_maintenance)}
                  </Text>
                </View>
              )}
            </View>
          </Card>
          
          {brewer.maintenance_notes && (
            <Card variant="default" style={{ marginTop: 16 }}>
              <Text variant="body" weight="medium" style={{ marginBottom: 8 }}>
                Maintenance Notes
              </Text>
              <Text variant="body" color="secondary" style={{ lineHeight: 20 }}>
                {brewer.maintenance_notes}
              </Text>
            </Card>
          )}
        </Section>
      )}

      {brewer.brewing_tips && brewer.brewing_tips.length > 0 && (
        <Section
          title="Brewing Tips"
          subtitle="Expert techniques for optimal results"
          spacing="lg"
        >
          <Card variant="default">
            <View style={styles.tipsGrid}>
              {brewer.brewing_tips.map((tip, index) => (
                <View key={index} style={styles.tipRow}>
                  <Text variant="body" weight="medium" style={{ color: theme.colors.success, marginRight: 8 }}>
                    •
                  </Text>
                  <Text variant="body" style={{ flex: 1, lineHeight: 20 }}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </Section>
      )}

      {brewer.notes && (
        <Section
          title="Notes"
          subtitle="Personal observations and preferences"
          spacing="lg"
        >
          <Card variant="default">
            <Text variant="body" style={{ lineHeight: 20 }}>
              {brewer.notes}
            </Text>
          </Card>
        </Section>
      )}

      <Section
        title="Quick Actions"
        subtitle="Edit details or manage this brewer"
        spacing="xl"
      >
        <View style={styles.actionsRow}>
          <Button
            title="Edit Brewer"
            variant="secondary"
            onPress={() => router.push(`/brewers/edit/${brewer.id}`)}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="New Recipe"
            variant="primary"
            onPress={() => router.push(`/brewprints/new?brewer_id=${brewer.id}`)}
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
      </Section>
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
  
  statusRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
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
  },
};